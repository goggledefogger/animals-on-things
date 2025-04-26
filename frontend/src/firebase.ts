// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
// IMPORTANT: Consider using environment variables for sensitive keys in a real app
const firebaseConfig = {
  apiKey: "AIzaSyDm7wHD14W9OOZXsCnBobg7r4_ZztcH7ZQ",
  authDomain: "animals-on-things.firebaseapp.com",
  projectId: "animals-on-things",
  storageBucket: "animals-on-things.appspot.com", // Corrected default storage bucket format
  messagingSenderId: "181835489390",
  appId: "1:181835489390:web:1adcfe2ad5f420ac8c467f",
  databaseURL: "https://animals-on-things-default-rtdb.firebaseio.com" // Add Realtime Database URL
};

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
    connectAuthEmulator(auth, "http://localhost:9099");
    connectDatabaseEmulator(db, "localhost", 9000);
    connectStorageEmulator(storage, "localhost", 9199);
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch (error) {
    console.error("Error connecting to Firebase emulators:", error);
  }
}

export { app, auth, db, storage, functions }; 