import * as functions from "firebase-functions/v1";
import {HttpsError} from "firebase-functions/v1/https";
import * as admin from "firebase-admin";
import OpenAI from "openai"; // Import the OpenAI library

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

// Initialize OpenAI client
// Read key from environment variable (set via .env file or Secret Manager)
// eslint-disable-next-line max-len
const openAIKey = process.env.OPENAI_API_KEY;
if (!openAIKey) {
  // Log error but don't throw here, let the function call handle it
  console.error("OpenAI API key environment variable (OPENAI_API_KEY) not set.");
}
// Only initialize if the key exists
// eslint-disable-next-line max-len
const openai = openAIKey ? new OpenAI({apiKey: openAIKey}) : null;

// Define a type for the fetched photo details
type FetchedPhotoDetail = {
  profileId: string;
  photoId: string;
  profileName: string;
  storagePath: string;
};

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
  const {selections, style, prompt} = data;

  // eslint-disable-next-line max-len
  if (!style || !selections || !Array.isArray(selections) || selections.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields: style and at least one selection " +
      "{profileId, photoId}.",
    );
  }

  // Further validation on selections array elements
  if (selections.some((sel) => !sel.profileId || !sel.photoId)) {
    throw new HttpsError(
      "invalid-argument",
      // eslint-disable-next-line max-len
      "Each selection must include a valid profileId and photoId.",
    );
  }

  // Split long log message
  functions.logger.info(
    `Generating combined image for user ${uid}, style ${style}, ` +
    `prompt: ${prompt || "(none)"}, ` +
    `selections: ${JSON.stringify(selections)}`,
  );

  // Check if OpenAI client was initialized
  if (!openai) {
    // Throw here if the client wasn't set up due to missing key
    throw new HttpsError("internal", "OpenAI API key is not configured correctly.");
  }

  // 3. Permission Check & Fetch Photo Info (Iterate through selections)
  const db = admin.database();
  // Fetch profile names along with storage paths for better prompt generation
  const detailFetchPromises = selections.map(async (selection) => {
    const profileRef = db.ref(`/profiles/${uid}/${selection.profileId}/name`);
    const photoRef = db.ref(
      `/profiles/${uid}/${selection.profileId}/photos/${selection.photoId}`);

    const [profileSnapshot, photoSnapshot] = await Promise.all([
      profileRef.get(),
      photoRef.get(),
    ]);

    if (!photoSnapshot.exists()) {
      // Split long error message
      throw new HttpsError("not-found",
        `Photo data not found for profile ${selection.profileId}, ` +
        `photo ${selection.photoId}.`);
    }
    // Profile name might not exist, handle gracefully
    const profileName = profileSnapshot.exists() ?
      profileSnapshot.val() :
      `Profile ${selection.profileId.substring(0, 4)}`;

    const photoData = photoSnapshot.val() as AnimalPhotoData;
    if (!photoData.storagePath) {
      // Split long error message
      throw new HttpsError("internal",
        `Missing storagePath for photo ${selection.photoId} in profile ` +
        `${selection.profileId}.`);
    }
    return {
      ...selection, // Keep profileId, photoId
      profileName: profileName,
      storagePath: photoData.storagePath,
    };
  });

  let fetchedPhotoDetails: FetchedPhotoDetail[];
  try {
    // Await and cast to the defined type
    fetchedPhotoDetails = await Promise.all(detailFetchPromises);
    // Split long log message
    functions.logger.info(
      "Successfully fetched details for all selected photos:",
      fetchedPhotoDetails
    );
  } catch (error) {
    functions.logger.error("Error fetching photo details:", error);
    if (error instanceof HttpsError) {
      throw error; // Re-throw HttpsError
    }
    throw new HttpsError("internal", "Failed to fetch details for selected photos.");
  }

  // ---- CORE AI LOGIC ----
  // 4. Prepare Input for AI Service
  // Construct a more descriptive prompt using profile names
  const animalDescriptions = fetchedPhotoDetails
    .map((p) => {
      const prefix = p.profileName || "animal";
      const shortId = p.profileId.substring(0, 4);
      return `${prefix} from profile ${shortId}`;
    })
    .join(", "); // e.g., "Cosmos, Luna"

  // Combine user prompt, animal descriptions, and style
  // eslint-disable-next-line max-len
  const combinedPrompt = `Create an image in a ${style} style featuring ` +
                       `${animalDescriptions}. ${prompt || ""}`.trim();
  functions.logger.info(`Constructed AI Prompt: ${combinedPrompt}`);

  // 5. Call External Image Generation Service (OpenAI - latest model)
  let generatedImageUrlFromApi: string | undefined;
  try {
    functions.logger.info("Calling OpenAI GPT Image Generation API...");
    // Use the newest gpt-image-1 model instead of dall-e-3
    const response = await openai.images.generate({
      model: "gpt-image-1", // Use the latest image generation model
      prompt: combinedPrompt,
      n: 1, // Generate one image
      size: "1024x1024",
      quality: "hd", // Use high quality for better results
      response_format: "url", // Get URL directly
    });

    generatedImageUrlFromApi = response.data?.[0]?.url;
    if (!generatedImageUrlFromApi) {
      functions.logger.error("OpenAI response missing image URL",
        {responseData: response.data});
      throw new Error("OpenAI response did not contain an image URL.");
    }
    functions.logger.info("OpenAI image generation successful.",
      {url: generatedImageUrlFromApi});
  } catch (error: unknown) {
    // Use `unknown` type for error
    functions.logger.error("OpenAI API call failed:", error);

    // Type guard to safely access potential properties
    let errorMessage = "Unknown OpenAI error";
    if (typeof error === "object" && error !== null) {
      // Need "any" here due to unknown response structure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const potentialMsg = (error as any).response?.data?.error?.message ||
        (error as Error).message;
      if (potentialMsg) {
        errorMessage = potentialMsg;
      }
    }
    // Split long error message
    throw new HttpsError("internal",
      `Failed to generate image: ${errorMessage}`);
  }
  // ---- END CORE AI LOGIC ----

  // 6. Upload Generated Image to Cloud Storage
  const finalImageUrl = generatedImageUrlFromApi || ""; // Default to empty string if somehow undefined
  try {
    // If we have a valid URL from OpenAI, store a copy in our own Storage
    if (generatedImageUrlFromApi) {
      // Declare but don't use bucket variable for now (uncomment when fully implementing)
      // const bucket = admin.storage().bucket();
      const timestamp = Date.now();
      const destination = `generated/${uid}/${timestamp}_${style}.jpg`;

      functions.logger.info(`Storing generated image in: ${destination}`);

      // We'll skip downloading and re-uploading for now
      // This would require an HTTP client, which we can add when needed:
      //
      // const axios = require('axios');
      // const imageResponse = await axios.get(generatedImageUrlFromApi,
      //   { responseType: 'arraybuffer' });
      // await bucket.file(destination).save(imageResponse.data,
      //   { contentType: 'image/jpeg' });
      //
      // const [signedUrl] = await bucket.file(destination).getSignedUrl({
      //   action: 'read',
      //   expires: '03-01-2500', // Far future expiration
      // });
      // finalImageUrl = signedUrl;

      // For now, just use the OpenAI URL directly
      functions.logger.info(`Using OpenAI URL directly: ${finalImageUrl}`);
    }
  } catch (uploadError) {
    // Non-fatal error - log but continue with the OpenAI URL
    functions.logger.error(
      "Failed to store generated image to Cloud Storage (non-fatal):",
      uploadError
    );
    // We'll continue and return the OpenAI URL
  }

  // 7. Save Metadata to Realtime Database
  try {
    // Always store metadata about the generated image
    const generatedImagesRef = db.ref(`/generatedImages/${uid}`).push();
    await generatedImagesRef.set({
      style,
      prompt: prompt || null,
      profileIds: fetchedPhotoDetails.map((s) => s.profileId),
      photoIds: fetchedPhotoDetails.map((s) => s.photoId),
      imageUrl: finalImageUrl,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });
    functions.logger.info("Saved generated image metadata to RTDB");
  } catch (dbError) {
    // Non-fatal error - log but don't fail the function
    functions.logger.error(
      "Failed to save generated image metadata (non-fatal):",
      dbError
    );
  }

  // 8. Return Result
  return {imageUrl: finalImageUrl};
});
