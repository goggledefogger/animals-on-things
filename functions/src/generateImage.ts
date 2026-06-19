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
  requestId?: string;
  quality?: "low" | "medium" | "high"; // Removed 'auto'
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
  console.error(
    "FATAL: OpenAI API key environment variable (OPENAI_API_KEY) not set."
  );
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
  .https.onCall(
    async (
      data: GenerateImageRequestData,
      context: functions.https.CallableContext
    ): Promise<{ imageUrl: string }> => {
      // 1. Authentication Check
      if (!context.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
      }
      const uid = context.auth.uid;

      // 1.5. Rate Limiting Check (Max 3 generations per 24 hours)
      const db = admin.database();
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      try {
        const recentImagesSnap = await db
          .ref(`/generatedImages/${uid}`)
          .orderByChild("createdAt")
          .startAt(oneDayAgo)
          .once("value");
        const recentImages = recentImagesSnap.val();
        if (recentImages && Object.keys(recentImages).length >= 3) {
          functions.logger.warn(
            `User ${uid} exceeded daily generation limit ` +
            `(${Object.keys(recentImages).length} in last 24h).`,
            {uid}
          );
          throw new HttpsError(
            "resource-exhausted",
            "You have reached your daily limit of 3 image generations. " +
            "Please try again tomorrow."
          );
        }
      } catch (error) {
        if (error instanceof HttpsError) {
          throw error;
        }
        functions.logger.error("Error checking rate limit:", {uid, error});
        throw new HttpsError(
          "internal",
          "An error occurred while checking image generation limits."
        );
      }

      // 2. Input Validation
      const {selections, style, prompt, requestId, model, quality} = data;
      const modelToUse = model || "gpt-image-1"; // Use provided model or default
      const qualityToUse = quality || "low"; // Default to low if not provided

      // Allow generation if style is null but prompt exists
      if (
        (!style && !prompt) ||
        !selections ||
        !Array.isArray(selections) ||
        selections.length === 0 ||
        !requestId
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required fields: (style or prompt), selections (array), and requestId."
        );
      }
      if (selections.some((sel) => !sel.profileId || !sel.photoId)) {
        throw new HttpsError(
          "invalid-argument",
          "Each selection must include a valid profileId and photoId."
        );
      }

      // Check if OpenAI client was initialized
      if (!openai) {
        functions.logger.error(
          "OpenAI client is not initialized. API Key likely missing.",
          {uid}
        );
        throw new HttpsError(
          "internal",
          "Image generation service is not configured correctly."
        );
      }

      // Log generation parameters
      functions.logger.info("Starting image generation", {
        uid,
        style,
        model: modelToUse,
        quality: qualityToUse,
        promptProvided: !!prompt,
        selectionCount: selections.length,
        requestId,
      });

      // 3. Fetch Profile/Photo Details (Name for prompt, Image Buffer for API)
      const storageBucket = admin.storage().bucket(); // Get storage bucket
      let fetchedPhotoDetails: FetchedPhotoDetail[];
      try {
        const detailFetchPromises = selections.map(async (selection) => {
          const profileNameRef = db.ref(
            `/profiles/${uid}/${selection.profileId}/name`
          );
          const photoRef = db.ref(
            `/profiles/${uid}/${selection.profileId}/photos/${selection.photoId}`
          );

          const [profileSnapshot, photoSnapshot] = await Promise.all([
            profileNameRef.get(),
            photoRef.get(),
          ]);

          if (!photoSnapshot.exists()) {
            throw new HttpsError(
              "not-found",
              `Photo data not found for profile ${selection.profileId}, photo ${selection.photoId}.`
            );
          }
          // Profile name might not exist, handle gracefully
          const profileName = profileSnapshot.exists() ?
            profileSnapshot.val() :
            `Profile ${selection.profileId.substring(0, 4)}`;
          const photoData = photoSnapshot.val() as AnimalPhotoData;
          if (!photoData.storagePath) {
            throw new HttpsError(
              "internal",
              `Missing storagePath for photo ${selection.photoId} in profile ${selection.profileId}.`
            );
          }

          // Download image from storage
          let downloadedImageBuffer: Buffer;
          try {
            const file = storageBucket.file(photoData.storagePath);
            const [buffer] = await file.download();
            downloadedImageBuffer = buffer;
            functions.logger.info(
              `Successfully downloaded image for ${selection.photoId} from ${photoData.storagePath}`,
              {uid}
            );
          } catch (downloadError) {
            functions.logger.error(
              `Failed to download image ${photoData.storagePath}:`,
              {uid, downloadError}
            );
            throw new HttpsError(
              "internal",
              `Failed to download source image for photo ${selection.photoId}.`
            );
          }

          return {
            ...selection, // Keep profileId, photoId
            profileName: profileName,
            storagePath: photoData.storagePath,
            imageBuffer: downloadedImageBuffer,
          };
        });

        fetchedPhotoDetails = await Promise.all(detailFetchPromises);
        functions.logger.info(
          "Successfully fetched details and image data for all selected photos:",
          {uid, count: fetchedPhotoDetails.length}
        );
      } catch (error) {
        functions.logger.error(
          "Error fetching photo details or downloading images:",
          {uid, error}
        );
        if (error instanceof HttpsError) {
          throw error; // Re-throw HttpsError
        }
        throw new HttpsError(
          "internal",
          "Failed to fetch details or download source images for selected photos."
        );
      }

      // 4. Construct Text Prompt for OpenAI
      const animalDescriptions = fetchedPhotoDetails
        .map(
          (p) =>
            p.profileName ||
            `animal from profile ${p.profileId.substring(0, 4)}`
        )
        .join(", "); // e.g., "Sparky, Luna"

      // Construct the prompt based on style and custom input
      let stylePhrase = "";
      if (style && style !== "None") {
        // Only add style phrase if style is present and not 'None'
        if (style === "Realistic") {
          stylePhrase = "in a photorealistic style";
        } else {
          // For other styles like "Comic Book", "Watercolor", etc.
          stylePhrase = `in a ${style} style`;
        }
      }

      // Combine parts, ensuring spaces are handled correctly
      const promptParts = [];
      promptParts.push("Create an image");
      if (stylePhrase) {
        promptParts.push(stylePhrase);
      }
      promptParts.push(`featuring ${animalDescriptions}`);
      if (prompt) {
        // Add custom prompt if provided
        const punctuationRegex = /[.!?]$/;
        const separator = punctuationRegex.test(animalDescriptions) ?
          " " :
          ". ";
        promptParts.push(separator + prompt);
      }
      // Ensure prompt ends with a period unless it already has ending punctuation
      const combinedPrompt =
        promptParts.join(" ").trim().replace(/\.$/, "") + ".";

      functions.logger.info(`Constructed AI Prompt: ${combinedPrompt}`, {
        uid,
        reqId: requestId,
      }); // Added requestId to log

      // 5. Call OpenAI Image Edit API
      let generatedImageBase64: string | undefined;
      try {
        // Prepare image data using the toFile helper
        const inputImagesPromises = fetchedPhotoDetails.map(
          async (detail, index) => {
            // Convert buffer to Uploadable using toFile
            // TODO: Determine file type dynamically from storage metadata if possible
            const filename = `input_${index}.png`; // Assume PNG for now
            const mimeType = "image/png"; // Assume PNG
            functions.logger.info(
              `Preparing file ${filename} (${mimeType}) for upload`,
              {uid}
            );
            return await toFile(detail.imageBuffer, filename, {
              type: mimeType,
            });
          }
        );
        const inputImages = await Promise.all(inputImagesPromises);
        functions.logger.info(
          `Prepared ${inputImages.length} input images for OpenAI.`,
          {uid}
        );

        functions.logger.info(
          `Calling OpenAI images.edit API with quality: ${qualityToUse}...`,
          {uid, model: modelToUse}
        ); // Log quality being used

        const response = await openai.images.edit({
          // Using .edit endpoint
          model: modelToUse,
          image: inputImages, // Pass the array of Uploadable files
          prompt: combinedPrompt,
          n: 1, // Generate one image
          size: "1024x1024",
          quality: qualityToUse, // Pass the quality parameter
          // response_format: "b64_json", // gpt-image-1 always returns b64_json
          user: uid, // Pass the Firebase user ID for monitoring
        });

        generatedImageBase64 = response.data?.[0]?.b64_json;
        if (!generatedImageBase64) {
          functions.logger.error(
            "OpenAI response missing image b64_json data",
            {uid, responseData: response.data}
          );
          throw new Error(
            "OpenAI response did not contain image b64_json data."
          );
        }
        functions.logger.info(
          "OpenAI image edit successful (received base64 data).",
          {uid}
        );
      } catch (error: unknown) {
        functions.logger.error("OpenAI API call failed:", {uid, error});
        let errorMessage = "Unknown OpenAI error";
        if (error instanceof OpenAI.APIError) {
          errorMessage = error.message || "OpenAI API Error";
          if (
            error.code === "invalid_prompt" ||
            error.code === "content_policy_violation"
          ) {
            errorMessage =
              "Image generation failed due to content policy or prompt issue. Please modify your prompt.";
          } else if (error.status === 429) {
            errorMessage =
              "Image generation service is currently overloaded. Please try again later.";
          } else if (error.status === 401) {
            errorMessage = "Image generation service authentication failed.";
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        throw new HttpsError(
          "internal",
          `Failed to generate image: ${errorMessage}`
        );
      }

      // 6. Upload Generated Image Base64 to Cloud Storage
      let finalImageUrl = "";
      let storagePathForDb: string | null = null; // Declare variable here

      try {
        if (generatedImageBase64) {
          const bucket = admin.storage().bucket();
          const timestamp = Date.now();
          // Construct the destination path within this block
          const destination = `generated/${uid}/${timestamp}_${
            style || "None"
          }.png`;
          storagePathForDb = destination; // Assign to outer variable

          functions.logger.info(
            `Storing generated image in Firebase Storage: ${destination}`,
            {uid}
          );

          const imageBuffer = Buffer.from(generatedImageBase64, "base64");
          const file = bucket.file(destination);
          await file.save(imageBuffer, {
            metadata: {
              contentType: "image/png", // Specify content type
              metadata: {
                firebaseStorageDownloadTokens: Date.now().toString(),
              },
            },
            // public: true, // Uncomment if public access is desired and bucket configured
          });
          functions.logger.info(
            "Image successfully uploaded to Firebase Storage.",
            {uid, destination}
          );

          const [signedUrl] = await file.getSignedUrl({
            action: "read",
            expires: "03-01-2500", // Far-future expiration
          });
          finalImageUrl = signedUrl;
          functions.logger.info(
            `Using Firebase Storage URL: ${finalImageUrl}`,
            {uid}
          );
        } else {
          functions.logger.warn(
            "No base64 image data received from OpenAI to upload.",
            {uid}
          );
          throw new HttpsError(
            "internal",
            "Image generated but could not be stored."
          );
        }
      } catch (uploadError) {
        functions.logger.error(
          "Failed to store generated image to Cloud Storage:",
          {uid, uploadError}
        );
        throw new HttpsError(
          "internal",
          "Failed to store the generated image."
        );
      }

      // 7. Save Metadata to Realtime Database
      try {
        const generatedImagesRef = db.ref(`/generatedImages/${uid}`).push();
        const metadataToSave = {
          requestId,
          style: style || null,
          prompt: prompt || null,
          profileIds: fetchedPhotoDetails.map((s) => s.profileId),
          photoIds: fetchedPhotoDetails.map((s) => s.photoId),
          imageUrl: finalImageUrl,
          storagePath: storagePathForDb, // Use the correctly scoped variable
          model: modelToUse,
          quality: qualityToUse, // Store the quality used
          createdAt: admin.database.ServerValue.TIMESTAMP,
        };
        await generatedImagesRef.set(metadataToSave);
        functions.logger.info("Saved generated image metadata to RTDB", {
          uid,
          reqId: requestId,
          ref: generatedImagesRef.key,
        });
      } catch (dbError) {
        functions.logger.error(
          "Failed to save generated image metadata (non-fatal):",
          {uid, reqId: requestId, dbError}
        );
      }

      // 8. Return Result (Firebase Storage URL)
      return {imageUrl: finalImageUrl};
    }
  );
