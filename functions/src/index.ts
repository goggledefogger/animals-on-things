import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK ONCE at the start
admin.initializeApp();

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Import and re-export functions from their files
export {generateImage} from "./generateImage";
export * from "./getImageHistory";

// Example placeholder (can be removed)
// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
