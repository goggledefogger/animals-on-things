import * as functions from "firebase-functions/v1";
import {HttpsError} from "firebase-functions/v1/https";
import * as admin from "firebase-admin";
import {URL} from "url"; // For robust URL parsing

// Define the expected input data structure
interface DeleteHistoryImageInput {
  generatedImageId: string;
}

// Define the expected output data structure
interface DeleteHistoryImageOutput {
  success: boolean;
}

/**
 * Extracts the storage path from a Firebase Storage URL.
 * Example URL: https://firebasestorage.googleapis.com/v0/b/your-bucket.appspot.com/o/path%2Fto%2Fimage.jpg?alt=media&token=...
 * @param {string} imageUrl The Firebase Storage URL.
 * @return {string | null} The decoded storage path (e.g., "path/to/image.jpg")
 * or null if parsing fails.
 */
function getPathFromStorageUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    if (url.hostname !== "firebasestorage.googleapis.com" || !url.pathname.startsWith("/v0/b/")) {
      functions.logger.warn("URL does not match expected Firebase Storage format:", imageUrl);
      return null;
    }
    // Pathname looks like /v0/b/bucket-name/o/encoded%2Fpath%2Fname.jpg
    const parts = url.pathname.split("/o/");
    if (parts.length < 2) {
      return null;
    }
    // Decode the URL-encoded path component
    const encodedPath = parts[1];
    return decodeURIComponent(encodedPath);
  } catch (error) {
    functions.logger.error("Error parsing storage URL:", {imageUrl, error});
    return null;
  }
}

/**
 * Firebase Callable function to delete a generated image history item
 * and its corresponding file from Firebase Storage.
 */
export const deleteHistoryImage = functions.https.onCall(
  async (data: DeleteHistoryImageInput, context): Promise<DeleteHistoryImageOutput> => {
    // 1. Authentication Check
    if (!context.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated to delete images.");
    }
    const userId = context.auth.uid;

    // 2. Input Validation
    const {generatedImageId} = data;
    if (!generatedImageId || typeof generatedImageId !== "string") {
      throw new HttpsError("invalid-argument", "The function must be called with a valid 'generatedImageId' string.");
    }

    functions.logger.info("Attempting to delete history image:", {userId, generatedImageId});

    const db = admin.database();
    const storage = admin.storage();
    const historyItemRef = db.ref(`/generatedImages/${userId}/${generatedImageId}`);

    try {
      // 3. Fetch History Item Data from RTDB
      const snapshot = await historyItemRef.once("value");
      const historyData = snapshot.val();

      if (!historyData) {
        functions.logger.warn("History item not found or user does not have permission.", {userId, generatedImageId});
        // Throw not-found, even if it might be permission, to avoid leaking info
        throw new HttpsError("not-found", "History item not found.");
      }

      const imageUrl = historyData.imageUrl;
      if (!imageUrl || typeof imageUrl !== "string") {
        functions.logger.error("History item is missing a valid imageUrl.", {userId, generatedImageId, historyData});
        // Still delete the DB record if possible, but log error
        await historyItemRef.remove();
        throw new HttpsError("internal", "History item data is corrupted (missing URL). Record deleted, but storage file might remain.");
      }

      // 4. Infer Storage Path and Delete File from Storage
      const storagePath = getPathFromStorageUrl(imageUrl);

      if (storagePath) {
        functions.logger.info("Inferred storage path:", {storagePath});
        try {
          // Get default bucket reference
          const bucket = storage.bucket(); // Use default bucket
          const file = bucket.file(storagePath);
          await file.delete();
          functions.logger.info("Successfully deleted file from storage.", {userId, generatedImageId, storagePath});
        } catch (storageError: any) {
          // Log storage error but attempt to delete DB record anyway
          functions.logger.error("Failed to delete file from storage, proceeding to delete DB record.", {userId, generatedImageId, storagePath, storageError});
          // Consider specific error codes (e.g., if file not found, maybe it's okay)
          if (storageError.code === 404) {
            functions.logger.warn("Storage file not found, likely already deleted.", {storagePath});
          } else {
            // Rethrow only if it's not a 404, as DB deletion is more critical
            // Consider the implications of not re-throwing. If DB delete fails later,
            // the overall operation might partially fail silently.
            // throw new HttpsError("internal", `Failed to delete storage file: ${storageError.message}`);
          }
        }
      } else {
        // Log that we couldn't parse the path, but proceed to delete DB record
        functions.logger.warn(
          "Could not determine storage path, skipping storage deletion.",
          {
            userId,
            generatedImageId,
            imageUrl,
          }
        );
      }

      // 5. Delete History Item from RTDB
      await historyItemRef.remove();
      functions.logger.info("Successfully deleted history item from RTDB.", {userId, generatedImageId});

      // 6. Return Success
      return {success: true};
    } catch (error: any) {
      // Catch HttpsError specifically to re-throw
      if (error instanceof HttpsError) {
        throw error;
      }
      // Log other unexpected errors
      functions.logger.error("Unexpected error during history image deletion:", {userId, generatedImageId, error});
      throw new HttpsError("internal", "An unexpected error occurred while deleting the image history item.");
    }
  }
);
