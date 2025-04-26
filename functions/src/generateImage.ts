import * as functions from "firebase-functions/v1";
import { HttpsError } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

// Admin SDK is initialized in index.ts

// Define the structure for a single selection expected from the client
interface GenerationSelection {
  profileId: string;
  photoId: string;
}

// Updated interface for the data expected by the function
interface GenerateImageRequestData {
  selections: GenerationSelection[];
  style: string;
  prompt?: string;
}

// Structure for photo metadata fetched from RTDB
interface AnimalPhotoData {
  storagePath: string;
  createdAt: number;
  // Add other fields if they exist in your RTDB schema (e.g., filename, contentType)
}

/**
 * Callable function to generate a new COMBINED image based on multiple
 * selected photos, a style, and an optional custom prompt.
 */
export const generateImage = functions.https.onCall(async (data: GenerateImageRequestData, context) => {
  // 1. Authentication Check
  if (!context.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }
  const uid = context.auth.uid;

  // 2. Input Validation 
  const { selections, style, prompt } = data;

  if (!style || !selections || !Array.isArray(selections) || selections.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields: style and at least one selection {profileId, photoId}.",
    );
  }

  // Further validation on selections array elements
  if (selections.some(sel => !sel.profileId || !sel.photoId)) {
     throw new HttpsError(
      "invalid-argument",
      "Each selection must include a valid profileId and photoId.",
    );
  }

  functions.logger.info(
    `Generating combined image for user ${uid}, ` +
    `style ${style}, prompt: ${prompt || "(none)"}, ` +
    `selections: ${JSON.stringify(selections)}`,
  );

  // 3. Permission Check & Fetch Photo Info (Iterate through selections)
  const db = admin.database();
  const photoFetchPromises = selections.map(async (selection) => {
    const photoRef = db.ref(`/profiles/${uid}/${selection.profileId}/photos/${selection.photoId}`);
    const snapshot = await photoRef.get();
    if (!snapshot.exists()) {
      throw new HttpsError(
        "not-found",
        `Photo data not found for profile ${selection.profileId}, photo ${selection.photoId}.`,
      );
    }
    // TODO: Add permission check if profile doesn't inherently belong to user uid path
    // For example, if profiles were stored in a root collection.
    
    const photoData = snapshot.val() as AnimalPhotoData;
    if (!photoData.storagePath) {
       throw new HttpsError(
        "internal", // Or invalid-argument if path should always exist
        `Missing storagePath for photo ${selection.photoId} in profile ${selection.profileId}.`,
      );
    }
    return { 
      ...selection, // Keep profileId, photoId 
      storagePath: photoData.storagePath 
    };
  });

  let fetchedPhotoDetails;
  try {
    fetchedPhotoDetails = await Promise.all(photoFetchPromises);
    functions.logger.info("Successfully fetched details for all selected photos:", fetchedPhotoDetails);
  } catch (error) {
    functions.logger.error("Error fetching photo details:", error);
    if (error instanceof HttpsError) {
      throw error; // Re-throw HttpsError
    }
    throw new HttpsError("internal", "Failed to fetch details for selected photos.");
  }

  // ---- CORE AI LOGIC ----
  // 4. Prepare Input for AI Service (THIS IS THE COMPLEX PART)
  // We have `fetchedPhotoDetails` which is an array: [{ profileId, photoId, storagePath }, ...]
  // We also have `style` and `prompt`.
  
  // Strategy needed:
  // - How to represent multiple images to OpenAI? (Likely via detailed text prompt)
  // - Can we fetch image descriptions or use URLs directly if API supports?
  // - Construct a final prompt incorporating the user's `prompt`, the `style`,
  //   and descriptions of the animals/images referenced by `fetchedPhotoDetails`.

  // Example Placeholder Prompt Construction:
  const animalDescriptions = fetchedPhotoDetails.map((p, i) => `animal ${i+1} from photo ${p.photoId.substring(0,4)}`).join(" and "); // VERY basic
  const combinedPrompt = `Create an image in a ${style} style featuring ${animalDescriptions}. ${prompt || ""}`.trim();
  functions.logger.info(`Constructed AI Prompt: ${combinedPrompt}`);

  // 5. Call External Image Generation Service (OpenAI)
  // TODO: Replace with actual OpenAI API call using the combined prompt
  functions.logger.info("Calling external image generation service (OpenAI)...", {combinedPrompt});
  // const generatedImageUrlFromApi = await callOpenAIImageGeneration(combinedPrompt, {/* potentially other options like size */});
  const generatedImageUrlFromApi =
    "placeholder/combined_generated_image.jpg"; // Placeholder
  functions.logger.info("Image generation service finished.");

  // ---- END CORE AI LOGIC ----

  // 6. Upload Generated Image to Cloud Storage (Optional but Recommended)
  // TODO: Decide on a storage path for combined images. Maybe not tied to a single profile?
  // const bucket = admin.storage().bucket(); 
  // const destination = `users/${uid}/generated/${new Date().toISOString()}_combined.jpg`;
  // await bucket.upload(generatedImageUrlFromApi, { destination });
  // const finalImageUrl = await getSignedUrlForPath(destination);
  const finalImageUrl = generatedImageUrlFromApi; // Use placeholder for now
  functions.logger.info(`Combined generated image at: ${finalImageUrl}`);

  // 7. Save Metadata to Realtime Database (Optional)
  // TODO: Save details about the generated image (URL, style, prompt, source selections, ts)
  // const generatedImagesRef = db.ref(`/generatedImages/${uid}`).push();
  // await generatedImagesRef.set({
  //   style: style,
  //   prompt: prompt || null,
  //   selections: fetchedPhotoDetails, // Save the input selections
  //   imageUrl: finalImageUrl,
  //   createdAt: admin.database.ServerValue.TIMESTAMP,
  // });

  // 8. Return Result
  return { imageUrl: finalImageUrl };
});
