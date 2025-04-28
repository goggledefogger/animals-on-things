import { useState, useCallback } from 'react';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';

// Input for the new Cloud Function
interface DeleteHistoryImageInput {
  generatedImageId: string;
}

// Expected output from the Cloud Function
interface DeleteHistoryImageOutput {
  success: boolean;
}

interface UseImageHistoryDeletionReturn {
  isDeleting: boolean;
  deletionError: string | null;
  deleteHistoryImage: (input: DeleteHistoryImageInput) => Promise<boolean>; // Returns true on success
}

/**
 * Custom hook to handle deleting an image history item via a Cloud Function.
 */
export function useImageHistoryDeletion(): UseImageHistoryDeletionReturn {
  const { currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);

  const deleteHistoryImage = useCallback(async (input: DeleteHistoryImageInput): Promise<boolean> => {
    if (!currentUser) {
      setDeletionError("User not authenticated.");
      return false;
    }

    setIsDeleting(true);
    setDeletionError(null);
    console.log('Calling deleteHistoryImage function with input:', input);

    try {
      const functions = getFunctions();
      // --- IMPORTANT: Define the actual Cloud Function name here ---
      const functionName = 'deleteHistoryImage'; // Make sure this matches the deployed function name
      const deleteFunc = httpsCallable<DeleteHistoryImageInput, DeleteHistoryImageOutput>(functions, functionName);

      const result = await deleteFunc(input);

      if (!result.data.success) {
        // Use a more specific error from the function if available, otherwise a generic one
        throw new Error("Delete function reported failure.");
      }

      console.log('Image history item deleted successfully via function.');
      return true; // Indicate success

    } catch (err: unknown) {
      console.error("Image history deletion Firebase Function call failed:", err);
      let message = 'An unknown error occurred during deletion.';
      if (err instanceof FunctionsError) {
        // Use err.details for more specific Firebase function errors if needed
        message = `${err.code}: ${err.message}`;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setDeletionError(message);
      return false; // Indicate failure
    } finally {
      setIsDeleting(false);
    }
  }, [currentUser]);

  return {
    isDeleting,
    deletionError,
    deleteHistoryImage,
  };
}
