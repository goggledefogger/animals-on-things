import * as functions from "firebase-functions/v1";
import {HttpsError} from "firebase-functions/v1/https";
// We need CallableContext for context.auth, but it wasn't explicitly used
// import { CallableContext } from "firebase-functions/v1/https";
// import * as admin from "firebase-admin"; // Assuming initialized elsewhere

// TODO: Initialize admin SDK if not done in index.ts
// try { admin.initializeApp(); } catch (e) { /* Already initialized */ }

interface GenerateImageData {
  photoId: string;
  profileId: string;
  style: string;
  prompt?: string;
}

/**
 * Callable function to generate a new image based on an existing photo,
 * a style, and an optional custom prompt.
 */
export const generateImage = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check
  if (!context.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }
  const uid = context.auth.uid;

  // 2. Input Validation (Data is the first argument)
  // Cast data to the expected interface for type safety within the function
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {photoId, profileId, style, prompt} = data as GenerateImageData;

  if (!photoId || !profileId || !style) {
    // Technically, this might be redundant if types enforce non-null,
    // but good for runtime safety
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields: photoId, profileId, or style.",
    );
  }

  // TODO: Validate style against allowed styles
  // TODO: Validate prompt length/content if necessary

  // Use prompt in log to satisfy linter for now
  functions.logger.info(
    `Generating image for user ${uid}, photo ${photoId}, ` +
    `profile ${profileId}, style ${style}, prompt: ${prompt || "(none)"}`,
  );

  // 3. Permission Check (Example: Check if user owns the profile/photo)
  // TODO: Implement actual permission logic based on your Firestore structure
  // const profileRef = admin.firestore().collection('profiles').doc(profileId);
  // const profileDoc = await profileRef.get();
  // if (!profileDoc.exists || profileDoc.data()?.userId !== uid) {
  //   throw new HttpsError(
  //     'permission-denied',
  //     'User does not have permission to access this profile.',
  //   );
  // }
  // Similar check for photo ownership might be needed

  // 4. Fetch Original Photo Info (e.g., get original image URL)
  // TODO: Fetch the original photo URL or data needed for generation service
  // Using originalImageUrl to satisfy linter for now
  const originalImageUrl = "placeholder/original/image/url.jpg";
  functions.logger.info(`Using original image: ${originalImageUrl}`);

  // 5. Call External Image Generation Service
  // TODO: Replace with actual API call
  functions.logger.info("Calling external image generation service...");
  // const generationResponse = await callImageGenerationApi(
  //    originalImageUrl, style, prompt
  // );
  // const generatedImageUrlFromApi = generationResponse.imageUrl;
  const generatedImageUrlFromApi =
    "placeholder/generated/image/url_from_api.jpg";
  functions.logger.info("Image generation service finished.");

  // 6. Upload Generated Image to Cloud Storage (optional)
  // TODO: Implement upload logic if needed
  // const bucket = admin.storage().bucket();
  // const destination = `profiles/${profileId}/photos/${photoId}/generated/` +
  //   `${new Date().toISOString()}_${style}.jpg`;
  // await bucket.upload(generatedImageUrlFromApi, {destination});
  // const finalImageUrl = await getSignedUrlForPath(destination);
  const finalImageUrl = generatedImageUrlFromApi;
  functions.logger.info(`Generated image at: ${finalImageUrl}`);

  // 7. Save Metadata to Firestore (optional)
  // TODO: Save details about the generated image (URL, style, prompt, ts)
  // const generatedImageRef = admin.firestore()
  //   .collection('profiles').doc(profileId)
  //   .collection('photos').doc(photoId)
  //   .collection('generatedImages').doc(); // Auto-ID
  // await generatedImageRef.set({
  //   style: style,
  //   prompt: prompt || null,
  //   imageUrl: finalImageUrl,
  //   createdAt: admin.firestore.FieldValue.serverTimestamp(),
  //   userId: uid,
  // });

  // 8. Return Result
  // Ensure the return type matches what client expects
  return {imageUrl: finalImageUrl};
});
