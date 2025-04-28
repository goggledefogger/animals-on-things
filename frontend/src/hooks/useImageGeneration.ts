import { useState, useCallback } from 'react';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext'; // To ensure user is authenticated

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

interface UseImageGenerationReturn {
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  generateImage: (input: GenerateImageInput) => Promise<void>; // Function to trigger generation
}

export function useImageGeneration(): UseImageGenerationReturn {
  const { currentUser } = useAuth(); // Get current user for auth check
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const generateImage = useCallback(async (input: GenerateImageInput) => {
    if (!currentUser) {
      setGenerationError("Authentication required to generate images."); // Slightly clearer message
      return;
    }
    if (input.selections.length === 0) {
        setGenerationError("At least one photo must be selected.");
        return;
    }
    if (!input.style && !input.prompt) {
        setGenerationError("A style or a custom prompt is required.");
        return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);

    console.log('Calling Firebase Function generateImage with input:', input);

    try {
      const functions = getFunctions();
      // Make sure the function name 'generateImage' matches your deployed function
      const generateImageFunction = httpsCallable<GenerateImageInput, GenerateImageOutput>(
        functions,
        'generateImage',
        { timeout: 540000 } // 540 seconds (9 minutes) in milliseconds
      );

      const result = await generateImageFunction(input);
      // On success, result.data should contain { imageUrl: string }
      const imageUrl = result.data.imageUrl;

      console.log('Firebase Function result:', result.data);

      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
      } else {
        // This case might indicate an unexpected success response format from the backend
        console.error('Function returned success but without an imageUrl:', result.data);
        throw new Error('Image generation succeeded but the result was invalid.');
      }
    } catch (err: unknown) {
      console.error("Firebase Function call failed:", err);
      let message = 'An unexpected error occurred during image generation.';
      // Extract message from known error types
      if (err instanceof FunctionsError) {
          // Use the message directly from the HttpsError thrown by the backend
          message = err.message;
      } else if (err instanceof Error) {
          message = err.message;
      }
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [currentUser]);

  return {
    isGenerating,
    generationError,
    generatedImageUrl,
    generateImage,
  };
}
