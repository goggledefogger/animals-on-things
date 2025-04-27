import * as functions from "firebase-functions/v1";
import { HttpsError } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

// Define the structure of the data stored in RTDB
// This should match the structure saved by the generateImage function
interface GeneratedImageData {
    style: string;
    prompt: string | null;
    profileIds: string[];
    photoIds: string[];
    imageUrl: string;
    model: string;
    finalPrompt: string;
    createdAt: number; // Assuming Firebase Server Timestamp resolves to number
    // Add generatedImageId which will be added when converting to array
    generatedImageId?: string;
}

/**
 * Firebase Callable function to fetch the user's generated image history
 * from the Realtime Database.
 */
export const getImageHistory = functions.https.onCall(async (_, context): Promise<GeneratedImageData[]> => {

    // 1. Authentication Check
    if (!context.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated to view image history.');
    }
    const userId = context.auth.uid;

    functions.logger.info("Fetching image history for user:", { userId });

    try {
        // 2. Access Realtime Database
        const db = admin.database();
        const historyRef = db.ref(`/generatedImages/${userId}`);

        // 3. Fetch Data
        const snapshot = await historyRef.once('value');
        const historyData = snapshot.val();

        // 4. Process Data
        if (!historyData) {
            functions.logger.info("No image history found for user.", { userId });
            return []; // Return empty array if no history exists
        }

        // Convert the object of objects into an array and add the ID
        const historyArray: GeneratedImageData[] = Object.keys(historyData).map(key => ({
            generatedImageId: key,
            ...historyData[key]
        }));

        // 5. Sort Data (Newest First)
        historyArray.sort((a, b) => b.createdAt - a.createdAt);

        functions.logger.info(`Returning ${historyArray.length} history items for user.`, { userId });

        // 6. Return Sorted Array
        return historyArray;

    } catch (error: unknown) {
        functions.logger.error("Error fetching image history from Realtime Database:", { userId, error });
        // Throw a generic error for the client
        throw new HttpsError('internal', 'An unexpected error occurred while fetching image history.');
    }
});
