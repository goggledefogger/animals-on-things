import { useState, useCallback } from 'react';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';

// Define the input structure for the Firebase Function
interface DeletePhotoInput {
  profileId: string;
  photoId: string;
  storagePath: string;
}

// Define the expected output structure from the Firebase Function
interface DeletePhotoOutput {
  success: boolean;
}

interface UsePhotoDeletionReturn {
  isDeleting: boolean;
  deletionError: string | null;
  deletePhoto: (input: DeletePhotoInput) => Promise<boolean>; // Returns true on success
}

/**
 * Custom hook to handle deleting a photo via a Cloud Function.
 */
export function usePhotoDeletion(): UsePhotoDeletionReturn {
  const { currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);

  const deletePhoto = useCallback(async (input: DeletePhotoInput): Promise<boolean> => {
    if (!currentUser) {
      setDeletionError("User not authenticated.");
      return false;
    }

    setIsDeleting(true);
    setDeletionError(null);
    console.log('Calling deletePhoto function with input:', input);

    try {
      const functions = getFunctions();
      const deletePhotoFunction = httpsCallable<DeletePhotoInput, DeletePhotoOutput>(functions, 'deletePhoto');

      const result = await deletePhotoFunction(input);

      if (!result.data.success) {
        throw new Error("Delete function reported failure.");
      }

      console.log('Photo deleted successfully via function.');
      return true; // Indicate success

    } catch (err: unknown) {
      console.error("Photo deletion Firebase Function call failed:", err);
      let message = 'An unknown error occurred during deletion.';
      if (err instanceof FunctionsError) {
        message = err.message;
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
    deletePhoto,
  };
}
