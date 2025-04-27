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
  imageUrl?: string;
  error?: string;
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
      setGenerationError("User not authenticated.");
      return;
    }
    if (input.selections.length === 0) {
        setGenerationError("No photos selected for generation.");
        return;
    }
    if (!input.style && !input.prompt) {
        setGenerationError("Style or prompt is required.");
        return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);

    console.log('Calling generateImage function with input:', input);

    try {
      const functions = getFunctions();
      // Make sure the function name 'generateImage' matches your deployed function
      const generateImageFunction = httpsCallable<GenerateImageInput, GenerateImageOutput>(functions, 'generateImage');

      const result = await generateImageFunction(input);
      const data = result.data;

      console.log('Function result:', data);

      if (data.error) {
        throw new Error(data.error);
      }
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        throw new Error('Function did not return an image URL or a specific error.');
      }
    } catch (err: unknown) {
      console.error("Image generation Firebase Function call failed:", err);
      let message = 'An unknown error occurred during generation.';
      if (err instanceof FunctionsError) {
          message = `Function error: ${err.code} - ${err.message}`;
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
