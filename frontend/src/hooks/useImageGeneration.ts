import { useState, useCallback, useEffect, useRef } from 'react';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { getDatabase, ref, query, orderByChild, limitToLast, onValue, off } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';

// Define the expected input structure for the Firebase Function
interface GenerateImageInput {
  selections: { profileId: string; photoId: string }[];
  style: string | null;
  prompt: string | null;
}

// Define the expected output structure from the Firebase Function
interface GenerateImageOutput {
  imageUrl: string; // Expect URL on success
}

// Define types for the history data with requestId
interface HistoryImageData {
    imageUrl: string;
    createdAt: number;
    requestId: string; // Added request ID
    generatedImageId?: string;
}

interface UseImageGenerationReturn {
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  generateImage: (input: GenerateImageInput) => Promise<void>; // Function to trigger generation
}

export function useImageGeneration(): UseImageGenerationReturn {
  const { currentUser } = useAuth();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  // Ref to store the ID of the *current* generation request
  const currentRequestIdRef = useRef<string | null>(null);

  // --- RTDB Listener Effect ---
  useEffect(() => {
    if (!currentUser) return; // No listener if no user

    const db = getDatabase();
    const recentImageQuery = query(
      ref(db, `generatedImages/${currentUser.uid}`),
      orderByChild('createdAt'),
      limitToLast(1)
    );

    let initialDataLoaded = false;

    const unsubscribe = onValue(recentImageQuery, (snapshot) => {
      if (!snapshot.exists()) {
         console.log("RTDB listener: No image data found.");
         initialDataLoaded = true;
         return;
      }

      const images = snapshot.val();
      const imageKey = Object.keys(images)[0];
      const latestImage = images[imageKey] as HistoryImageData;
      console.log("Current request ID ref:", currentRequestIdRef.current);

      if (!initialDataLoaded) {
          initialDataLoaded = true;
          if (isGenerating && currentRequestIdRef.current) {
              console.log("Listener attached during active generation, ignoring initial data.");
              return;
          }
      }

      // Check if this image corresponds to the request we are waiting for
      if (latestImage.requestId && latestImage.requestId === currentRequestIdRef.current) {
          console.log(`RTDB listener: Match found for request ID: ${latestImage.requestId}`);
          setGeneratedImageUrl(latestImage.imageUrl);
          setGenerationError(null);
          setIsGenerating(false);
          currentRequestIdRef.current = null;
      }
       else {
            // Handle potential recovery on initial load if image is very recent
            const fiveSecondsAgo = Date.now() - 5000;
            if (!isGenerating && !currentRequestIdRef.current && latestImage.createdAt > fiveSecondsAgo) {
                console.log("RTDB listener: Found very recent image with no matching/pending request ID. Displaying anyway (recovery).", latestImage.imageUrl);
                setGeneratedImageUrl(latestImage.imageUrl);
                setGenerationError(null);
            }
       }
    }, (error) => {
       console.error("RTDB listener error:", error);
    });

    // Cleanup function
    return () => {
      off(recentImageQuery, 'value', unsubscribe);
    };
  }, [currentUser]); // Rerun listener setup if user changes


  const generateImage = useCallback(async (input: GenerateImageInput) => {
    // Generate a unique ID for this request
    const requestId = uuidv4();
    currentRequestIdRef.current = requestId; // Track this request

    // Reset state for the new request
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);

    // Pre-flight checks
    if (!currentUser) { setGenerationError("Auth required."); setIsGenerating(false); currentRequestIdRef.current = null; return; }
    if (input.selections.length === 0) { setGenerationError("Selection required."); setIsGenerating(false); currentRequestIdRef.current = null; return; }
    if (!input.style && !input.prompt) { setGenerationError("Style or prompt required."); setIsGenerating(false); currentRequestIdRef.current = null; return; }

    console.log(`Calling generateImage function with reqId: ${requestId}`, input);

    try {
      const functions = getFunctions();
      // Ensure type includes requestId for the call
      const generateImageFunction = httpsCallable<GenerateImageInput & { requestId: string }, GenerateImageOutput>(
        functions, 'generateImage', { timeout: 540000 }
      );

      // Include requestId in the payload
      const result = await generateImageFunction({ ...input, requestId });
      console.log(`Direct function call successful for reqId: ${requestId}`, result.data);

      // Direct response is secondary, listener is primary.
      // Optionally set image here for speed if listener hasn't fired.
      if (currentRequestIdRef.current === requestId && result.data.imageUrl) {
          console.log(`Setting image URL from direct response for reqId: ${requestId} (listener may override)`);
          setGeneratedImageUrl(result.data.imageUrl);
          // Let listener clear the ref and set isGenerating false
      }

    } catch (err: unknown) {
      console.error(`Function call failed for reqId: ${requestId}`, err);
      if (currentRequestIdRef.current === requestId) {
         let finalErrorMessage = 'An unexpected error occurred.';
         if (err instanceof FunctionsError) {
             const techDetails = `(code: ${err.code}${err.details ? ", details: " + JSON.stringify(err.details) : ""})`;
             if (err.code === 'internal') {
                 finalErrorMessage = `Internal error during generation. Check gallery. ${techDetails}`;
             } else {
                 finalErrorMessage = `${err.message} ${techDetails}`.trim();
             }
         } else if (err instanceof Error) {
             finalErrorMessage = err.message;
         }
         setGenerationError(finalErrorMessage);
         setGeneratedImageUrl(null);
         // Keep ref set; listener might still succeed
         setIsGenerating(false); // Stop loading on error
      }
    }
    // No finally block setting isGenerating=false; listener handles it on success, catch handles it on failure.
  }, [currentUser]);

  return {
    isGenerating,
    generationError,
    generatedImageUrl,
    generateImage,
  };
}
