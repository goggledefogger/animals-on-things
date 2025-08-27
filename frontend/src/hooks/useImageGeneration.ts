import { useState, useCallback, useEffect, useRef } from 'react';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { getDatabase, ref, query, orderByChild, limitToLast, onValue, off, DataSnapshot } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';

// Define the expected input structure for the Firebase Function
interface GenerateImageInput {
  selections: { profileId: string; photoId: string }[];
  style: string | null;
  prompt: string | null;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  model?: string;
}

// Define the expected output structure from the Firebase Function
// (The function might return immediately, or the listener might provide the URL later)
interface GenerateImageOutput {
  imageUrl?: string; // URL might be returned directly for quick cases
  // No explicit error needed here, handled by FunctionsError or listener timeout
}

// Define the structure of the data expected from the RTDB listener
interface HistoryImageData {
    imageUrl: string;
    requestId: string;
    createdAt: number;
    // other fields exist but aren't needed by this listener
}

interface UseImageGenerationReturn {
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  generateImage: (input: GenerateImageInput) => Promise<void>; // Function to trigger generation
}

// Timeout slightly longer than the cloud function's 540s timeout
const CLIENT_SIDE_TIMEOUT_MS = 600000; // 10 minutes

export function useImageGeneration(): UseImageGenerationReturn {
  const { currentUser } = useAuth();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for the client-side timeout

  // --- Utility to clear timeout ---
  const clearClientTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // --- RTDB Listener Effect ---
  useEffect(() => {
    if (!currentUser) {
        // Clear state if user logs out
        setIsGenerating(false);
        setGenerationError(null);
        setGeneratedImageUrl(null);
        currentRequestIdRef.current = null;
        clearClientTimeout();
        return;
    }

    const db = getDatabase();
    const recentImageQuery = query(
      ref(db, `generatedImages/${currentUser.uid}`),
      orderByChild('createdAt'),
      limitToLast(1)
    );

    let initialDataLoaded = false; // To potentially ignore stale data on initial load if already generating

    const listenerCallback = (snapshot: DataSnapshot) => { // Use client-side DataSnapshot type
      if (!snapshot.exists()) {
         console.log("RTDB listener: No image data found.");
         initialDataLoaded = true;
         return;
      }

      const images = snapshot.val();
      const imageKey = Object.keys(images)[0]; // Assumes non-empty object
      const latestImage = images[imageKey] as HistoryImageData;
      console.log("RTDB listener received:", latestImage);
      console.log("Current request ID ref:", currentRequestIdRef.current);

      // If the listener fires *while* we're actively generating,
      // ignore the initial data load event unless it matches our request ID.
      if (!initialDataLoaded && isGenerating && currentRequestIdRef.current) {
          console.log("RTDB listener: Initial data received during active generation.");
          initialDataLoaded = true;
          // Only process if it matches the current request
          if (!latestImage.requestId || latestImage.requestId !== currentRequestIdRef.current) {
              console.log("RTDB listener: Initial data doesn't match current request, ignoring.");
              return;
          }
      }
      initialDataLoaded = true; // Mark initial data as loaded after first check

      // Check if this image corresponds to the request we are waiting for
      if (latestImage.requestId && latestImage.requestId === currentRequestIdRef.current) {
          console.log(`RTDB listener: Match found for request ID: ${latestImage.requestId}`);
          setGeneratedImageUrl(latestImage.imageUrl);
          setGenerationError(null);
          setIsGenerating(false);
          currentRequestIdRef.current = null; // Request completed
          clearClientTimeout(); // Clear the safety timeout
      } else {
          // Handle potential recovery: If not generating, and image is very recent, show it.
          const fiveSecondsAgo = Date.now() - 5000;
          if (!isGenerating && !currentRequestIdRef.current && latestImage.createdAt > fiveSecondsAgo) {
              console.log("RTDB listener: Found very recent image with no matching/pending request ID. Displaying (recovery).");
              setGeneratedImageUrl(latestImage.imageUrl);
              setGenerationError(null);
              clearClientTimeout(); // Clear any stray timeout
          } else {
             console.log("RTDB listener: Data received doesn't match current request ID or isn't recent enough for recovery.");
          }
      }
    };

    const errorCallback = (error: Error) => { // Firebase RTDB errors are typically Error instances
       console.error("RTDB listener error:", error);
       // Potentially set a state error, but often these self-recover or are permission issues
       // For now, just log it. If persistent, might need more handling.
       // setError("Failed to listen for image updates.");
    };

    // Subscribe
    onValue(recentImageQuery, listenerCallback, errorCallback); // Removed unused variable assignment

    // Cleanup function
    return () => {
      console.log("RTDB listener cleaning up.");
      off(recentImageQuery, 'value', listenerCallback); // Detach the specific callback
      // Note: Firebase documentation often shows just passing the query to off(),
      // but specifying the event type ('value') and callback might be safer.
      clearClientTimeout(); // Clear timeout on unmount
    };
    // Rerun effect if user changes
  }, [currentUser, isGenerating, clearClientTimeout]); // Added isGenerating to deps for the initial load check


  const generateImage = useCallback(async (input: GenerateImageInput) => {
    const requestId = uuidv4();
    currentRequestIdRef.current = requestId;

    // Reset state for the new request
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);
    clearClientTimeout(); // Clear previous timeout just in case

    // Start client-side safety timeout
    timeoutRef.current = setTimeout(() => {
      if (currentRequestIdRef.current === requestId) { // Check if STILL waiting for THIS request
        console.warn(`Client-side timeout reached for reqId: ${requestId}`);
        setGenerationError("Image generation is taking longer than expected. Please check the gallery later or try again.");
        setIsGenerating(false);
        currentRequestIdRef.current = null; // Give up on this request ID
      }
    }, CLIENT_SIDE_TIMEOUT_MS);

    // Pre-flight checks (remain the same)
    if (!currentUser) {
      setGenerationError("Authentication is required to generate images.");
      setIsGenerating(false);
      currentRequestIdRef.current = null;
      clearClientTimeout();
      return;
    }
    if (input.selections.length === 0) {
      setGenerationError("Please select at least one photo for generation.");
      setIsGenerating(false);
      currentRequestIdRef.current = null;
      clearClientTimeout();
      return;
    }
    if (!input.style && !input.prompt) {
      setGenerationError("A style or a custom prompt is required.");
      setIsGenerating(false);
      currentRequestIdRef.current = null;
      clearClientTimeout();
      return;
    }

    console.log(`Calling generateImage function with reqId: ${requestId}, Quality: ${input.quality || 'low'}`, input);

    try {
      const functions = getFunctions();
      const generateImageFunction = httpsCallable<GenerateImageInput & { requestId: string }, GenerateImageOutput>(
        functions, 'generateImage', { timeout: 540000 } // Keep function timeout
      );

      // Call the function, including the quality from the input object
      const result = await generateImageFunction({ ...input, requestId });
      console.log(`Direct function call successful for reqId: ${requestId}`, result.data);

      // OPTIONAL: Set image URL from direct response for potentially faster UI update,
      // but only if the listener hasn't already handled it.
      if (currentRequestIdRef.current === requestId && result.data.imageUrl && !generatedImageUrl) {
          console.log(`Setting image URL from direct response for reqId: ${requestId} (listener might override)`);
          setGeneratedImageUrl(result.data.imageUrl);
          // DO NOT set isGenerating false or clear timeout here - let the listener confirm.
      }

    } catch (err: unknown) {
      // Log any client-side error from the initial call
      console.error(`Client-side error during generateImage call for reqId: ${requestId}. Error object:`, err);

      // ONLY set state for errors that definitively mean the function couldn't have run.
      // For network issues, timeouts, internal client errors, etc., let the listener/timeout handle it.
      if (err instanceof FunctionsError) {
        const code = err.code;
        // Explicitly list codes that indicate a definite failure before/during the call attempt itself.
        const isDefinitiveFailure = code === 'unauthenticated' || code === 'invalid-argument' || code === 'permission-denied';

        if (isDefinitiveFailure) {
            console.error(`Definitive client-side FunctionsError (${code}) for reqId: ${requestId}. Setting error state.`);
            const techDetails = `(code: ${code}${err.details ? ", details: " + JSON.stringify(err.details) : ""})`;
            const finalErrorMessage = `${err.message} ${techDetails}`.trim();
            setGenerationError(finalErrorMessage);
            setIsGenerating(false); // Stop loading
            clearClientTimeout(); // Clear the safety timeout
            currentRequestIdRef.current = null; // This request definitely failed
        } else {
            // For other FunctionsError codes (internal, unavailable, deadline-exceeded, cancelled),
            // log them but assume they might be recoverable or the function might have succeeded anyway.
            console.warn(`Potentially recoverable client-side FunctionsError (${code}) for reqId: ${requestId}. Waiting for listener/timeout.`);
            // DO NOTHING to UI state here.
        }
      } else {
        // For generic JS Errors or unknown types (often network issues),
        // log them but assume the function might have succeeded.
        console.warn(`Generic client-side error for reqId: ${requestId}. Waiting for listener/timeout.`, err);
        // DO NOTHING to UI state here.
      }
    }
    // REMOVED finally block. State is managed by listener, timeout, or definitive errors in catch.
  }, [currentUser, clearClientTimeout, generatedImageUrl]); // Added generatedImageUrl to deps for direct response check

  return {
    isGenerating,
    generationError,
    generatedImageUrl,
    generateImage,
  };
}
