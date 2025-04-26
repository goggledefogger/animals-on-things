# Software Requirements Specification: Animals-On-Things (Phase 1 - Firebase Backend)

This document details the technical requirements for Phase 1, using **Firebase** for backend services and focusing on anonymous user persistence and core AI image generation. The project also aims to eventually incorporate features supporting animal welfare and conservation causes.

-   **System Design**
    -   Client-Server architecture.
    -   The client is a web-based Single Page Application (SPA) interacting directly with Firebase services (Auth, **Realtime Database**, Storage) and triggering backend logic via Firebase Cloud Functions.
    -   Backend logic resides in Firebase Cloud Functions, triggered by HTTPS requests or **other Firebase events (e.g., Cloud Scheduler for Phase 3)**.

-   **Architecture pattern**
    -   **Frontend:** Single Page Application (SPA) using component-based architecture (React).
    -   **Backend:** Serverless (Firebase Cloud Functions), Database-as-a-Service (**Realtime Database**), Storage-as-a-Service (Firebase Storage), Auth-as-a-Service (Firebase Authentication).

### Frontend Architecture Details

-   **Folder Structure (`frontend/src/`):**
    -   `App.tsx`: Main application component, sets up layout and routing (if needed later).
    -   `main.tsx`: Application entry point, initializes React, wraps App with providers.
    -   `firebase.ts`: Firebase configuration and SDK initialization.
    -   `components/`: Reusable UI components (e.g., Button, Card, Input, Modal).
        -   `common/`: General-purpose, stateless components.
        -   `features/`: Components specific to a feature area (e.g., `AnimalProfile/`, `ImageGeneration/`).
            -   `AnimalProfileList.tsx`
            -   `AddAnimalProfileForm.tsx`
            -   `PhotoUploader.tsx`
            -   `PhotoGallery.tsx`
            -   `StyleSelector.tsx`
            -   `GenerationResult.tsx`
    -   `contexts/`: React Context providers and hooks (e.g., `AuthContext.tsx`).
    -   `hooks/`: Custom React hooks for encapsulating logic.
        -   `useAuth.ts`: (Already part of AuthContext) Hook to access auth state.
        -   `useAnimalProfiles.ts`: Hook for fetching and managing animal profiles (CRUD operations via Firebase Realtime Database).
        -   `useAnimalPhotos.ts`: Hook for fetching and managing photos for a specific profile (CRUD operations via Firebase Storage & Realtime Database).
        -   `useImageGeneration.ts`: Hook for calling the `generateImage` Cloud Function and managing generation state.
    -   `services/`: Modules for interacting with external services (e.g., Firebase functions wrappers, though often hooks are sufficient).
    -   `types/`: TypeScript type definitions (e.g., `AnimalProfile.ts`, `AnimalPhoto.ts`).
    -   `utils/`: Utility functions (e.g., date formatters, validation helpers).
    -   `assets/`: Static assets like images, fonts.
    -   `styles/`: Global styles or Tailwind configuration extensions (though often `index.css` is sufficient).

-   **State Management:**
    -   **Global State:** React Context API (`contexts/`) for authentication state (`AuthContext`). Will consider adding context for managing currently selected animal profile if needed across multiple components.
    -   **Remote State / Data Fetching:** Custom hooks (`hooks/`) will manage interaction with Firebase (Realtime Database, Storage, Functions). These hooks will handle fetching data, loading states, and errors. For Realtime Database, hooks will utilize `onValue` listeners for real-time updates where appropriate.
    -   **Local Component State:** Standard `useState` and potentially `useReducer` for UI state within individual components (e.g., form inputs, modal visibility).

-   **Component Design:**
    -   Prioritize functional components with hooks.
    -   Aim for clear separation of concerns:
        -   **Feature Components (`components/features/`):** Combine UI presentation with data fetching/mutation logic via custom hooks.
        -   **Common Components (`components/common/`):** Purely presentational, reusable UI elements receiving data and callbacks via props.
    -   Keep components relatively small and focused on a single responsibility.

-   **Firebase Interactions:**
    -   All direct interactions with Firebase services (Auth, Realtime Database, Storage, Functions) will be encapsulated within custom hooks (`hooks/`) or dedicated service modules (`services/` if complexity warrants).
    -   Components will consume these hooks to get data and trigger actions (e.g., `const { profiles, addProfile, isLoading } = useAnimalProfiles();`).
    -   Hooks will leverage the `currentUser.uid` from `useAuth()` to interact with the correct data paths in Firebase.
    -   Realtime Database interactions will use the `firebase/database` SDK.
    -   Storage interactions will use the `firebase/storage` SDK.
    -   Cloud Function calls will use the `firebase/functions` SDK (HTTPS callable functions).

-   **State management**
    -   **Frontend (Phase 1):** Firebase SDK for managing auth state (anonymous user) and **Realtime Database** interactions. React's built-in state management (`useState`, `useContext`) for UI state. Realtime Database listeners provide reactive data updates.
    -   **Backend:** Cloud Functions are typically stateless, relying on **Realtime Database**/Storage for state persistence.

-   **Data flow (Example: Image Generation)**
    1.  User accesses the web application (hosted on Firebase Hosting).
    2.  Frontend uses Firebase Auth SDK to sign in the user anonymously if not already signed in. Gets the anonymous `uid`.
    3.  User creates/selects an Animal Profile (data fetched from/written to **Realtime Database** under `/profiles/$uid`).
    4.  User uploads a photo for the selected Animal Profile using Firebase Storage SDK (rules enforce ownership based on `uid`).
    5.  User selects an uploaded photo (identified by its path/ID in **Realtime Database**/Storage) and chooses a style/prompt.
    6.  Frontend makes an HTTPS request to a specific Firebase Cloud Function (`generateImage`), sending the selected photo identifier, style/prompt, and the user's `uid` (verified via auth token).
    7.  Cloud Function (`generateImage`) verifies the user token.
    8.  Cloud Function retrieves the image data from Firebase Storage using the provided identifier.
    9.  Cloud Function constructs the appropriate request for the external OpenAI API (`gpt-image-1`), including the image data and prompt.
    10. Cloud Function calls the OpenAI API and awaits the response.
    11. OpenAI API processes the request and returns the generated image.
    12. Cloud Function receives the generated image.
    13. Cloud Function potentially saves the result (e.g., back to Firebase Storage or **Realtime Database**, associated with the user `uid`) and returns the generated image URL/data to the frontend.
    14. Frontend receives the response and displays the generated image.
    15. User can click a button to download the image directly.

-   **Data flow (Example: Daily Image Generation - Phase 3)**
    1.  Cloud Scheduler triggers the `dailyImageGenerator` Cloud Function daily for each opted-in user.
    2.  Function retrieves user ID (`uid`) and potentially user preferences/animal list from the trigger payload or database.
    3.  Function calls an LLM (e.g., via OpenAI Chat Completions API) with the current date to determine a relevant theme/event.
    4.  Function selects one or more animal photos for the user (e.g., random, most recent) from Realtime Database/Storage.
    5.  Function constructs a prompt for the OpenAI Image Generation API (`gpt-image-1`) combining the theme and the selected animal photo(s).
    6.  Function calls the image generation API.
    7.  Function receives the generated image.
    8.  Function stores the generated image URL and theme/metadata in the Realtime Database under a path like `/dailyImages/$uid/$date`.
    9.  (Optional) Function sends a notification to the user (e.g., via FCM).

-   **Technical Stack**
    -   **Frontend:** React, TypeScript, Tailwind CSS, Vite
    -   **Backend Platform:** Firebase
        -   **Hosting:** Firebase Hosting
        -   **Database:** **Realtime Database**
        -   **Storage:** Firebase Cloud Storage
        -   **Functions:** Firebase Cloud Functions (Node.js/TypeScript recommended, or Python)
        -   **Authentication:** Firebase Authentication (Anonymous Auth for Phase 1)
        -   **(Phase 3) Scheduler:** Google Cloud Scheduler (for triggering daily function)
    -   **AI Service:** OpenAI API (`gpt-image-1` for image generation, potentially Chat Completions API for theme generation in Phase 3)
        -   *Note:* API Key management via Firebase Functions environment configuration.
        -   *Note:* Cost considerations remain.
    -   **Package Management:** npm/yarn (Frontend & Cloud Functions if Node.js/TS)

-   **Authentication Process**
    -   Phase 1 uses **Firebase Anonymous Authentication**. The frontend SDK handles sign-in and provides a persistent anonymous `uid`.
    -   Cloud Functions will verify user identity via Firebase Auth tokens passed in requests.
    -   **Realtime Database** & Storage security rules will be used to enforce data access based on `uid`.

-   **Route Design**
    -   **Frontend:** Client-side routing handled by React (e.g., using `react-router-dom`). Hosted at the root of Firebase Hosting.
    -   **Backend (API):** Firebase Cloud Functions exposed via HTTPS endpoints (e.g., `https://<region>-<project-id>.cloudfunctions.net/generateImage`).

-   **API Design (Cloud Functions)**
    -   **Function:** `generateImage` (HTTPS Trigger)
        -   **Request (POST):** `{ "photoKey": "unique_key_from_rtdb", "style": "optional_style_name", "prompt": "optional_custom_prompt" }` (Authorization header with Firebase ID token)
        -   **Response (Success - 200 OK):** `{ "imageUrl": "url_to_generated_image.jpg" }`
        -   **Response (Error - 4xx/5xx):** `{ "error": "Error message" }`
    -   *Other functions needed:* Possibly functions for complex data operations not suitable for direct client access, or scheduled tasks later.
    -   **(Phase 3) Function:** `dailyImageGenerator` (Cloud Scheduler Trigger)
        -   Handles logic described in Phase 3 data flow.

-   **Database Design (Firestore)**
    -   **Collections:**
        -   `users`: Stores anonymous user data (document ID = `uid`). May be minimal initially.
        -   `animalProfiles`: (Subcollection under `users/{uid}/animalProfiles` OR Root collection with `ownerUid` field).
            -   Fields: `name` (string), `createdAt` (timestamp).
        -   `animalPhotos`: (Subcollection under `animalProfiles/{profileId}/animalPhotos` OR Root collection with `ownerUid` and `profileId` fields).
            -   Fields: `storagePath` (string), `downloadUrl` (string, optional), `createdAt` (timestamp).
    -   *Data modeling decisions (subcollections vs. root collections with UIDs) impact query complexity and security rule design.*

-   **Database Design (Realtime Database)**
    -   **Structure (Example JSON):**
      ```json
      {
        "profiles": {
          "$uid": { // Anonymous User ID
            "$profileId": { // Auto-generated key for profile
              "name": "Sparky the Squirrel",
              "createdAt": 1678886400000,
              "photos": {
                "$photoId": { // Auto-generated key for photo
                  "storagePath": "user/$uid/profiles/$profileId/sparky1.jpg",
                  "createdAt": 1678886450000
                },
                "$photoId2": { ... }
              }
            },
            "$profileId2": { ... }
          }
        },
        "generatedImages": {
          "$uid": {
            "$generatedImageId": {
              "prompt": "Sparky riding a tiny motorcycle",
              "style": "comic book",
              "sourcePhotoId": "$photoId",
              "profileId": "$profileId",
              "resultUrl": "...",
              "createdAt": 1678887000000
            }
          }
        },
        "userPreferences": { // Added for Phase 3+
          "$uid": {
            "dailyImageEnabled": true,
            "featuredAnimalProfileIds": ["$profileId1", "$profileId2"]
          }
        },
        "dailyImages": { // Added for Phase 3+
          "$uid": {
            "YYYY-MM-DD": { // Date as key
               "theme": "National Squirrel Day",
               "imageUrl": "...",
               "createdAt": 1678888000000
            }
          }
        }
      }
      ```
    -   *Data is denormalized where appropriate. Security rules are critical for protecting paths based on `$uid`.*