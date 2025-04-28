import * as functions from "firebase-functions/v1";
import {HttpsError} from "firebase-functions/v1/https";
import * as admin from "firebase-admin";
import OpenAI, {toFile} from "openai";

// Admin SDK should be initialized in index.ts

// Define the structure for a single selection expected from the client
interface GenerationSelection {
  profileId: string;
  photoId: string; // Kept for potential future use or detailed logging
}

// Updated interface for the data expected by the function
interface GenerateImageRequestData {
  selections: GenerationSelection[];
  style: string;
  prompt?: string;
  model?: string; // Optional model override (defaults to gpt-image-1)
}

// Type for the shape of data read from RTDB for photos
interface AnimalPhotoData {
  storagePath: string;
  createdAt?: number; // Optional, based on schema
  // Add other fields if they exist (e.g., filename, contentType)
}

// Define a type for the fetched photo details including profile name and image buffer
type FetchedPhotoDetail = {
  profileId: string;
  photoId: string;
  profileName: string; // Added profile name
  storagePath: string;
  imageBuffer: Buffer;
};

// Initialize OpenAI client
const openAIKey = process.env.OPENAI_API_KEY;
if (!openAIKey) {
  // Log error during initialization
  console.error("FATAL: OpenAI API key environment variable (OPENAI_API_KEY) not set.");
}
// Initialize client - it will be null if key is missing
const openai = openAIKey ? new OpenAI({apiKey: openAIKey}) : null;

/**
 * Callable function to generate a new image based on multiple
 * selected photos, a style, and an optional custom prompt.
 * Logic based on commit 8fb0812e.
 */
// eslint-disable-next-line max-len
export const generateImage = functions
  .runWith({
    timeoutSeconds: 540, // Set timeout to 9 minutes (max allowed)
  })
  .https.onCall(async (data: GenerateImageRequestData, context: functions.https.CallableContext): Promise<{ imageUrl: string }> => {
  // 1. Authentication Check
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }
  const uid = context.auth.uid;

  // 2. Input Validation
  const {selections, style, prompt} = data;
  const modelToUse = data.model || "gpt-image-1"; // Default to gpt-image-1 for edits

  if (!style || !selections || !Array.isArray(selections) || selections.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields: style and selections (array of {profileId, photoId}).",
    );
  }
  if (selections.some((sel) => !sel.profileId || !sel.photoId)) {
    throw new HttpsError(
      "invalid-argument",
      "Each selection must include a valid profileId and photoId.",
    );
  }

  // Check if OpenAI client was initialized
  if (!openai) {
    functions.logger.error("OpenAI client is not initialized. API Key likely missing.", {uid});
    throw new HttpsError("internal", "Image generation service is not configured correctly.");
  }

  functions.logger.info(
    `Generating edited image for user ${uid}, style ${style}, model ${modelToUse}, ` +
    `prompt: ${prompt || "(none)"}, selections: ${JSON.stringify(selections)}`,
  );

  // 3. Fetch Profile/Photo Details (Name for prompt, Image Buffer for API)
  const db = admin.database();
  const storageBucket = admin.storage().bucket(); // Get storage bucket
  let fetchedPhotoDetails: FetchedPhotoDetail[];
  try {
    const detailFetchPromises = selections.map(async (selection) => {
      const profileNameRef = db.ref(`/profiles/${uid}/${selection.profileId}/name`);
      const photoRef = db.ref(`/profiles/${uid}/${selection.profileId}/photos/${selection.photoId}`);

      const [profileSnapshot, photoSnapshot] = await Promise.all([
        profileNameRef.get(),
        photoRef.get(),
      ]);

      if (!photoSnapshot.exists()) {
        throw new HttpsError("not-found", `Photo data not found for profile ${selection.profileId}, photo ${selection.photoId}.`);
      }
      // Profile name might not exist, handle gracefully
      const profileName = profileSnapshot.exists() ? profileSnapshot.val() : `Profile ${selection.profileId.substring(0, 4)}`;
      const photoData = photoSnapshot.val() as AnimalPhotoData;
      if (!photoData.storagePath) {
        throw new HttpsError("internal", `Missing storagePath for photo ${selection.photoId} in profile ${selection.profileId}.`);
      }

      // Download image from storage
      let downloadedImageBuffer: Buffer;
      try {
        const file = storageBucket.file(photoData.storagePath);
        const [buffer] = await file.download();
        downloadedImageBuffer = buffer;
        functions.logger.info(`Successfully downloaded image for ${selection.photoId} from ${photoData.storagePath}`, {uid});
      } catch (downloadError) {
        functions.logger.error(`Failed to download image ${photoData.storagePath}:`, {uid, downloadError});
        throw new HttpsError("internal", `Failed to download source image for photo ${selection.photoId}.`);
      }

      return {
        ...selection, // Keep profileId, photoId
        profileName: profileName,
        storagePath: photoData.storagePath,
        imageBuffer: downloadedImageBuffer,
      };
    });

    fetchedPhotoDetails = await Promise.all(detailFetchPromises);
    functions.logger.info("Successfully fetched details and image data for all selected photos:", {uid, count: fetchedPhotoDetails.length});
  } catch (error) {
    functions.logger.error("Error fetching photo details or downloading images:", {uid, error});
    if (error instanceof HttpsError) {
      throw error; // Re-throw HttpsError
    }
    throw new HttpsError("internal", "Failed to fetch details or download source images for selected photos.");
  }

  // 4. Construct Text Prompt for OpenAI
  const animalDescriptions = fetchedPhotoDetails
    .map((p) => p.profileName || `animal from profile ${p.profileId.substring(0, 4)}`)
    .join(", "); // e.g., "Sparky, Luna"

  const combinedPrompt = `Create an image in a ${style} style featuring ${animalDescriptions}. ${prompt || ""}`.trim();
  functions.logger.info(`Constructed AI Prompt: ${combinedPrompt}`, {uid});

  // 5. Call OpenAI Image Edit API
  let generatedImageBase64: string | undefined;
  try {
    // Prepare image data using the toFile helper
    const inputImagesPromises = fetchedPhotoDetails.map(async (detail, index) => {
      // Convert buffer to Uploadable using toFile
      // TODO: Determine file type dynamically from storage metadata if possible
      const filename = `input_${index}.png`; // Assume PNG for now
      const mimeType = "image/png"; // Assume PNG
      functions.logger.info(`Preparing file ${filename} (${mimeType}) for upload`, {uid});
      return await toFile(detail.imageBuffer, filename, {type: mimeType});
    });
    const inputImages = await Promise.all(inputImagesPromises);
    functions.logger.info(`Prepared ${inputImages.length} input images for OpenAI.`, {uid});

    functions.logger.info("Calling OpenAI images.edit API...", {uid, model: modelToUse});

    const response = await openai.images.edit({ // Using .edit endpoint
      model: modelToUse,
      image: inputImages, // Pass the array of Uploadable files
      prompt: combinedPrompt,
      n: 1, // Generate one image
      size: "1024x1024",
      // quality: "high", // quality param not applicable to edit endpoint
      user: uid, // Pass the Firebase user ID for monitoring
    });

    generatedImageBase64 = response.data?.[0]?.b64_json;
    if (!generatedImageBase64) {
      functions.logger.error("OpenAI response missing image b64_json data", {uid, responseData: response.data});
      throw new Error("OpenAI response did not contain image b64_json data.");
    }
    functions.logger.info("OpenAI image edit successful (received base64 data).", {uid});
  } catch (error: unknown) {
    functions.logger.error("OpenAI API call failed:", {uid, error});
    let errorMessage = "Unknown OpenAI error";
    if (error instanceof OpenAI.APIError) {
      errorMessage = error.message || "OpenAI API Error";
      if (error.code === "invalid_prompt" || error.code === "content_policy_violation") {
        errorMessage = "Image generation failed due to content policy or prompt issue. Please modify your prompt.";
      } else if (error.status === 429) {
        errorMessage = "Image generation service is currently overloaded. Please try again later.";
      } else if (error.status === 401) {
        errorMessage = "Image generation service authentication failed.";
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new HttpsError("internal", `Failed to generate image: ${errorMessage}`);
  }

  // 6. Upload Generated Image Base64 to Cloud Storage
  let finalImageUrl = ""; // Initialize final URL
  try {
    if (generatedImageBase64) {
      const bucket = admin.storage().bucket(); // Get default bucket
      const timestamp = Date.now();
      const destination = `generated/${uid}/${timestamp}_${style}.png`; // Store as png

      functions.logger.info(`Storing generated image in Firebase Storage: ${destination}`, {uid});

      // Decode base64 string to buffer
      const imageBuffer = Buffer.from(generatedImageBase64, "base64");

      // Upload buffer to Firebase Storage
      const file = bucket.file(destination);
      await file.save(imageBuffer, {
        metadata: {
          contentType: "image/png", // Specify content type
          metadata: {firebaseStorageDownloadTokens: Date.now().toString()},
        },
        // public: true, // Uncomment if public access is desired and bucket configured
      });
      functions.logger.info("Image successfully uploaded to Firebase Storage.", {uid, destination});

      // Get a signed URL
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires: "03-01-2500", // Far-future expiration
      });
      finalImageUrl = signedUrl;

      functions.logger.info(`Using Firebase Storage URL: ${finalImageUrl}`, {uid});
    } else {
      // Should not happen if API call succeeded
      functions.logger.warn("No base64 image data received from OpenAI to upload.", {uid});
      throw new HttpsError("internal", "Image generated but could not be stored.");
    }
  } catch (uploadError) {
    functions.logger.error("Failed to store generated image to Cloud Storage:", {uid, uploadError});
    throw new HttpsError("internal", "Failed to store the generated image.");
  }

  // 7. Save Metadata to Realtime Database
  try {
    const generatedImagesRef = db.ref(`/generatedImages/${uid}`).push();
    await generatedImagesRef.set({
      style,
      prompt: prompt || null,
      profileIds: fetchedPhotoDetails.map((s) => s.profileId),
      photoIds: fetchedPhotoDetails.map((s) => s.photoId),
      imageUrl: finalImageUrl,
      model: modelToUse,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    functions.logger.info("Saved generated image metadata to RTDB", {uid, ref: generatedImagesRef.key});
  } catch (dbError) {
    // Non-fatal error for metadata saving
    functions.logger.error("Failed to save generated image metadata (non-fatal):", {uid, dbError});
  }

  // 8. Return Result (Firebase Storage URL)
  return {imageUrl: finalImageUrl};
});
