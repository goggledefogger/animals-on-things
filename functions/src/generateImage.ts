import * as functions from "firebase-functions/v1";
import { HttpsError } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";
import OpenAI from "openai";

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

// Initialize OpenAI client
const openAIKey = process.env.OPENAI_API_KEY;
if (!openAIKey) {
  // Log error during initialization
  console.error("FATAL: OpenAI API key environment variable (OPENAI_API_KEY) not set.");
}
// Initialize client - it will be null if key is missing
const openai = openAIKey ? new OpenAI({apiKey: openAIKey}) : null;

// Function to fetch descriptive details about selected animals
async function getAnimalDescriptions(selections: GenerationSelection[]): Promise<string> {
    // TODO: Fetch richer animal details (e.g., color, key features) beyond name/breed
    // from Firestore profiles to improve prompt quality for image generation.

    const descriptions: string[] = [];
    const firestore = admin.firestore();

    try {
        const profilePromises = selections.map(sel =>
            firestore.collection('profiles').doc(sel.profileId).get()
        );
        const profileSnaps = await Promise.all(profilePromises);

        for (let i = 0; i < profileSnaps.length; i++) {
            const profileSnap = profileSnaps[i];
            const selection = selections[i];

            if (profileSnap.exists) {
                const profileData = profileSnap.data();
                // --- Placeholder description logic ---
                const name = profileData?.name || 'pet';
                const breed = profileData?.breed ? ` ${profileData.breed}` : ''; // Add breed if available
                descriptions.push(`a${breed} named ${name}`);
                // --- End placeholder logic ---
            } else {
                functions.logger.warn(`Profile data not found for ID: ${selection.profileId}`);
                descriptions.push(`an animal (Profile ID: ${selection.profileId.substring(0, 4)})`); // Fallback with ID
            }
        }
    } catch (error) {
        functions.logger.error("Error fetching animal descriptions from Firestore:", error);
        return `the selected animals (${selections.length})`; // Generic fallback
    }

    // Log the final constructed description string for debugging
    const finalDescriptionString = descriptions.length === 0 ? 'the selected animals' :
                                  descriptions.length === 1 ? descriptions[0] :
                                  descriptions.slice(0, -1).join(', ') + ' and ' + descriptions.slice(-1);
    functions.logger.info("Constructed animal descriptions string:", { finalDescriptionString });

    return finalDescriptionString;
}

/**
 * Callable function to generate a new image based on selected profiles,
 * a style, and an optional custom prompt using OpenAI's image generation API.
 */
export const generateImage = functions.https.onCall(async (data: GenerateImageRequestData, context: functions.https.CallableContext): Promise<{ imageUrl: string }> => {
    // 1. Authentication
    if (!context.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated to generate images.');
    }
    const userId = context.auth.uid;

    // Check if OpenAI client was initialized correctly
    if (!openai) {
        functions.logger.error("OpenAI client is not initialized. API Key likely missing.", { userId });
        throw new HttpsError("internal", "Image generation service is not configured correctly.");
    }

    // 2. Input Validation & Model Selection
    const { selections, style, prompt } = data;
    const model = data.model || "gpt-image-1"; // Default to gpt-image-1

    // Basic validation
    if (!Array.isArray(selections) || selections.length === 0 || typeof style !== 'string' || !style) {
        throw new HttpsError('invalid-argument', 'Request requires a non-empty selections array and a style string.');
    }
    // Validate structure within selections
    for (const sel of selections) {
        if (typeof sel.profileId !== 'string' || !sel.profileId || typeof sel.photoId !== 'string' || !sel.photoId) {
            throw new HttpsError('invalid-argument', 'Each item in the selections array must have valid profileId and photoId strings.');
        }
    }

    functions.logger.info("Initiating image generation request.", { userId, model, style, customPromptProvided: !!prompt, selectionCount: selections.length });

    try {
        // 3. Fetch Animal Descriptions from Firestore/DB
        const animalDescriptions = await getAnimalDescriptions(selections);

        // 4. Construct the Prompt for OpenAI
        const systemPrompt = `Generate a high-quality, creative image. Focus on the specified animals as the main subjects, rendered according to the provided style and scene description. Ensure the animals are recognizable based on their descriptions.`;

        const promptParts: string[] = [systemPrompt];

        // Add style description only if it's meaningful (not just "custom")
        if (style && style.toLowerCase() !== 'custom') {
            promptParts.push(`Style: ${style}.`);
        }

        // Add animal descriptions
        promptParts.push(`Featuring: ${animalDescriptions}.`);

        // Add user's custom prompt if provided
        if (prompt && typeof prompt === 'string' && prompt.trim()) {
            promptParts.push(`Scene/Details: ${prompt.trim()}.`);
        }

        const finalPrompt = promptParts.join(' ');
        functions.logger.info("Constructed final prompt for OpenAI:", { userId, finalPrompt });


        // 5. Call OpenAI API using the initialized client
        const response = await openai.images.generate({
             model: model,
             prompt: finalPrompt,
             n: 1,                     // Number of images to generate
             size: "1024x1024",        // DALL-E 3 / gpt-image-1 supported size
             quality: "standard",      // "standard" or "hd"
             response_format: "url",   // Request URL directly
             user: userId              // Pass Firebase UID for tracking/moderation
        });

        // Safer access to the URL from the response
        const imageUrl = response.data?.[0]?.url;

        // Validate the response
        if (!imageUrl) {
            // Log the entire response for debugging if data or URL is missing
            functions.logger.error("No image URL received from OpenAI or data missing in response", { userId, response });
            throw new HttpsError('internal', 'Failed to generate image: No valid URL returned by the image service.');
        }

        functions.logger.info("Image generated successfully by OpenAI.", { userId, imageUrl });

        // 6. Persist generated image metadata (Optional but recommended)
        try {
            const generatedImagesRef = admin.database().ref(`/generatedImages/${userId}`).push();
            await generatedImagesRef.set({
              style,
              prompt: prompt || null, // Store null if no prompt was provided
              // Store selections used for this generation
              profileIds: selections.map((s) => s.profileId),
              photoIds: selections.map((s) => s.photoId),
              imageUrl: imageUrl,       // Store the direct OpenAI URL
              model: model,             // Store the model used
              finalPrompt: finalPrompt, // Store the exact prompt sent to OpenAI
              createdAt: admin.database.ServerValue.TIMESTAMP,
            });
            functions.logger.info("Saved generated image metadata to Realtime Database.", { userId, refPath: generatedImagesRef.toString() });
          } catch (dbError) {
            // Log error but don't fail the entire function
            functions.logger.error("Failed to save generated image metadata (non-fatal):", { userId, dbError });
          }

        // 7. Return the result to the client
        return { imageUrl };

    } catch (error: unknown) { // Use unknown for better type safety in catch block
        functions.logger.error("Error during image generation process:", { userId, error });

        // Handle known Firebase HttpsError
        if (error instanceof HttpsError) {
            throw error;
        }

        // Handle known OpenAI API errors
        if (error instanceof OpenAI.APIError) {
           functions.logger.error("OpenAI API Error details:", {
               userId,
               status: error.status,
               message: error.message,
               code: error.code,
               type: error.type,
           });
           // Provide a user-friendly message based on common errors
           let clientMessage = `Image generation failed: ${error.message}`;
           if (error.code === 'invalid_prompt' || error.code === 'content_policy_violation') {
               clientMessage = "Image generation failed due to content policy or prompt issue. Please modify your prompt and try again.";
           } else if (error.status === 429) { // Rate limit error
                clientMessage = "Image generation service is currently overloaded. Please try again in a few moments.";
           } else if (error.status === 401) { // Authentication error
                clientMessage = "Image generation service authentication failed. Please contact support.";
           }
           throw new HttpsError('internal', clientMessage);
        }

        // General fallback for other unexpected errors
        throw new HttpsError('internal', 'An unexpected error occurred while generating the image.');
    }
});
