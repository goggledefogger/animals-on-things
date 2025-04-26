// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Load Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, 
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Basic validation to ensure variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration environment variables are missing! Make sure VITE_FIREBASE_... variables are set in your .env file.");
  // Optionally throw an error or display a message to the user
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to Emulators in development
// Vite exposes env variables through import.meta.env
if (import.meta.env.DEV) {
  console.log("Connecting to Firebase Emulators");
  // Default ports, ensure they match firebase.json
  try {
    // ** Temporarily commented out to force connection to LIVE Firebase services **
    // connectAuthEmulator(auth, "http://localhost:9099");
    // connectDatabaseEmulator(db, "localhost", 9000);
    // connectStorageEmulator(storage, "localhost", 9199);
    // connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("Emulator connections COMMENTED OUT - using LIVE services.");
  } catch (error) {
    console.error("Error connecting to Firebase emulators:", error);
  }
}

export { app, auth, db, storage, functions }; 