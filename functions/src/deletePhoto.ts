import * as functions from "firebase-functions/v1";
import {HttpsError} from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

// Define expected input data
interface DeletePhotoData {
    profileId: string;
    photoId: string;
    storagePath: string;
}

/**
 * Firebase Callable function to delete a specific photo metadata from RTDB
 * and the corresponding file from Cloud Storage.
 */
export const deletePhoto = functions.https.onCall(
  async (data: DeletePhotoData, context): Promise<{ success: boolean }> => {
    // 1. Authentication Check
    if (!context.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated to delete photos.");
    }
    const userId = context.auth.uid;

    // 2. Input Validation
    const {profileId, photoId, storagePath} = data;
    if (!profileId || !photoId || !storagePath) {
      throw new HttpsError("invalid-argument", "Missing required data: profileId, photoId, or storagePath.");
    }

    functions.logger.info("Attempting photo deletion for user:", {userId, profileId, photoId, storagePath});

    // Basic path validation (prevent accessing outside expected structure)
    // Example: Ensure storagePath starts with `users/${userId}/profiles/${profileId}/`
    const expectedPrefix = `users/${userId}/profiles/${profileId}/`;
    if (!storagePath.startsWith(expectedPrefix)) {
      functions.logger.error("Invalid storage path provided.", {userId, storagePath, expectedPrefix});
      throw new HttpsError("permission-denied", "Invalid storage path specified.");
    }

    try {
      // 3. Delete from Realtime Database
      const db = admin.database();
      const photoDbRef = db.ref(`/profiles/${userId}/${profileId}/photos/${photoId}`);
      await photoDbRef.remove();
      functions.logger.info("Removed photo metadata from RTDB.", {userId, profileId, photoId});

      // 4. Delete from Cloud Storage
      try {
        const bucket = admin.storage().bucket(); // Default bucket
        const file = bucket.file(storagePath);
        await file.delete();
        functions.logger.info("Deleted photo file from Cloud Storage.", {userId, storagePath});
      } catch (storageError: unknown) {
        // Log error but don't fail if object is already gone (idempotency)
        const errorCode = (storageError as { code?: number | string })?.code;
        if (errorCode === 404 || errorCode === "storage/object-not-found") {
          functions.logger.warn("Photo file not found in Cloud Storage (already deleted or invalid path?).", {userId, storagePath});
        } else {
          // Re-throw other storage errors
          functions.logger.error("Error deleting photo file from Cloud Storage:", {userId, storagePath, storageError});
          throw new HttpsError("internal", "Failed to delete photo file from storage.");
        }
      }

      // 5. Return Success
      return {success: true};
    } catch (error: unknown) {
      functions.logger.error("Error during photo deletion process:", {userId, profileId, photoId, error});
      if (error instanceof HttpsError) {
        throw error; // Re-throw known HttpsError
      }
      throw new HttpsError("internal", "An unexpected error occurred while deleting the photo.");
    }
  }
);
