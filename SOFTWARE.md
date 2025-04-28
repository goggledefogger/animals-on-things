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
    -   `App.tsx`: Main application component, sets up layout, manages multi-select state for profiles/photos.
    -   `main.tsx`: Application entry point, initializes React, wraps App with providers.
    -   `firebase.ts`: Firebase configuration and SDK initialization.
    -   `components/`: Reusable UI components.
        -   `common/`: General-purpose, stateless components (Button, Card, Input, PhotoThumbnail).
        -   `features/`: Components specific to a feature area.
            -   `AnimalProfileList.tsx`: Handles display and multi-selection of animal profiles.
            -   `AddAnimalProfileForm.tsx`: Form to add new animal profiles.
            -   `PhotoUploader.tsx`: Handles uploading photos for a specific profile.
            -   `SelectedPhotosPanel.tsx`: Displays selected profiles and allows choosing one photo per profile.
            -   `ImageGenerationPanel.tsx`: Controls for style, prompt, and triggering generation based on selected pairs.
            -   `PhotoGallery.tsx`: *(Deprecated/Replaced by SelectedPhotosPanel for generation selection)* May still be useful for general photo viewing/management within a profile.
            -   `AnimalPhotoItem.tsx`: *(Deprecated/Replaced by PhotoThumbnail)*
            -   `StyleSelector.tsx`: *(Part of ImageGenerationPanel)*
            -   `GenerationResult.tsx`: *(Part of ImageGenerationPanel)*
    -   `contexts/`: React Context providers and hooks (e.g., `AuthContext.tsx`).
    -   `hooks/`: Custom React hooks for encapsulating logic.
        -   `useAuth.ts`: (Already part of AuthContext) Hook to access auth state.
        -   `useAnimalProfiles.ts`: Hook for fetching and managing animal profiles.
        -   `useAnimalPhotos.ts`: Hook for fetching photos for a specific profile.
        -   `useImageGeneration.ts`: *(Needs update)* Hook for calling the `generateImage` Cloud Function and managing generation state (will need to handle array input).
    -   `services/`: Modules for interacting with external services.
    -   `types/`: TypeScript type definitions (e.g., `AnimalProfile.ts`, `AnimalPhoto.ts`).
    -   `utils/`: Utility functions.
    -   `assets/`: Static assets like images, fonts.
    -   `styles/`: Global styles or Tailwind configuration extensions.

-   **State Management:**
    -   **Global State:** React Context API (`contexts/`) for authentication state (`AuthContext`).
    -   **App-Level State (`App.tsx`):** Manages the list of multi-selected `AnimalProfile` objects and the mapping of `profileId` to selected `photoId` (`SelectedPhotoMap`).
    -   **Remote State / Data Fetching:** Custom hooks (`hooks/`) manage interaction with Firebase.
    -   **Local Component State:** `useState` for UI state within components.

-   **Component Design:**
    -   Prioritize functional components with hooks.
    -   **Common Components (`components/common/`):** Reusable UI elements (Button, Card, Input, PhotoThumbnail).
    -   **Feature Components (`components/features/`):** Combine UI presentation with data fetching/mutation logic via custom hooks or props passed from `App.tsx`.

-   **Firebase Interactions:**
    -   Encapsulated within custom hooks (`hooks/`).
    -   Components consume hooks or receive data/handlers via props.
    -   Hooks use `currentUser.uid` from `useAuth()`.
    -   Realtime Database: `firebase/database` SDK.
    -   Storage: `firebase/storage` SDK (including `getDownloadURL` for `PhotoThumbnail`).
    -   Functions: `firebase/functions` SDK (HTTPS callable functions).

-   **State management**
    -   **Frontend (Phase 1):** Firebase SDK for auth state. React state (`useState`, `useCallback`) in `App.tsx` for managing selections. Realtime Database listeners in hooks for data updates.
    -   **Backend:** Cloud Functions remain stateless.

-   **Data flow (Example: Image Generation - Multi-Select)**
    1.  User accesses the web application.
    2.  Frontend signs in user anonymously (`uid`).
    3.  User multi-selects desired Animal Profiles in `AnimalProfileList` (state updates in `App.tsx`).
    4.  `SelectedPhotosPanel` displays selected profiles.
    5.  For each selected profile, `SelectedPhotosPanel` (using `MiniPhotoGallery` and `PhotoThumbnail`) fetches and displays photo thumbnails from Storage (via `useAnimalPhotos` hook + `getDownloadURL`).
    6.  User selects *one* photo thumbnail for each profile in `SelectedPhotosPanel`. The `profileId: photoId` mapping updates in `App.tsx` state.
    7.  User selects style/enters prompt in `ImageGenerationPanel`.
    8.  User clicks "Generate".
    9.  Frontend (`App.tsx`) prepares the `selections` array (containing `{profileId, photoId}` pairs for profiles with a selected photo).
    10. Frontend makes an HTTPS request to `generateImage` Cloud Function, sending the `selections` array, style/prompt, and user's ID token.
    11. Cloud Function (`generateImage`) verifies token.
    12. Cloud Function iterates through the `selections` array, retrieving corresponding **image data (buffers)** and profile names from Firebase Storage/Database.
    13. Cloud Function formulates a text `prompt` using profile names, style, and user input.
    14. Cloud Function calls OpenAI API endpoint **`images.edit`** with the **input image buffers** and the text `prompt`.
    15. OpenAI API returns the single, combined generated image as **base64 data**.
    16. Cloud Function receives the result.
    17. Cloud Function **decodes the base64 data, uploads the new image to Firebase Storage**, gets a URL, and saves result metadata (including the Storage URL) to the database.
    18. Frontend (`ImageGenerationPanel`) receives the **Firebase Storage URL** and displays the generated image.
    19. User can download the image.

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
        -   **Authentication:** Firebase Authentication
        -   **(Phase 3) Scheduler:** Google Cloud Scheduler (for triggering daily function)
    -   **AI Service:** OpenAI API (`gpt-image-1` for image generation, potentially Chat Completions API for theme generation in Phase 3)
        -   *Note:* API Key management via Firebase Functions environment configuration.
        -   *Note:* Cost considerations remain.
    -   **Package Management:** npm/yarn (Frontend & Cloud Functions if Node.js/TS)

-   **Authentication Process**
    -   Phase 1 uses **Firebase Authentication**.
    -   Cloud Functions will verify user identity via Firebase Auth tokens passed in requests.
    -   **Realtime Database** & Storage security rules will be used to enforce data access based on `uid`.

-   **Route Design**
    -   **Frontend:** Client-side routing handled by React (e.g., using `react-router-dom`). Hosted at the root of Firebase Hosting.
    -   **Backend (API):** Firebase Cloud Functions exposed via HTTPS endpoints (e.g., `https://<region>-<project-id>.cloudfunctions.net/generateImage`).

-   **API Design (Cloud Functions)**
    -   **Function:** `generateImage` (HTTPS Trigger)
        -   **Request (POST):** `{ \"selections\": [{ \"profileId\": \"...\". \"photoId\": \"...\" }, ...], \"style\": \"optional_style_name\", \"prompt\": \"optional_custom_prompt\" }` (Authorization header with Firebase ID token)
        -   **Response (Success - 200 OK):** `{ \"imageUrl\": \"url_to_single_generated_image.jpg\" }` (URL points to **Firebase Storage**)
        -   **Response (Error - 4xx/5xx):** `{ \"error\": \"Error message\" }`
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
              "name": "Pepe the Skunk",
              "createdAt": 1678886400000,
              "photos": {
                "$photoId": { // Auto-generated key for photo
                  "storagePath": "user/$uid/profiles/$profileId/pepe1.jpg",
                  "createdAt": 1678886450000
                  // NOTE: downloadUrl is NOT stored here, fetched on demand by client
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
              "prompt": "Sparky and Mittens playing chess",
              "style": "cartoon",
              "model": "gpt-image-1",
              // Store the input selections that generated this image
              "sourceSelections": [
                { "profileId": "$profileId", "photoId": "$photoId" },
                { "profileId": "$profileId_mittens", "photoId": "$photoId_mittens" }
              ],
              "resultUrl": "...",
              "createdAt": 1678887000000
            }
          }
        },
        "userPreferences": {
          "$uid": {
            "dailyImageEnabled": true,
            "featuredAnimalProfileIds": ["$profileId1", "$profileId2"]
          }
        },
        "dailyImages": {
          "$uid": {
            "YYYY-MM-DD": {
               "theme": "National Squirrel Day",
               "imageUrl": "...",
               "createdAt": 1678888000000
            }
          }
        }
      }
      ```
    -   *Data is denormalized where appropriate. Security rules are critical for protecting paths based on `$uid`.*
    -   **Indexes:** Define `.indexOn` rules in `database.rules.json` for fields used in queries (e.g., `.indexOn: "createdAt"` added to `/generatedImages/$uid` for efficient retrieval of recent images).

-   **Security Considerations**
    -   **Realtime Database:**
        -   **Indexes:** Define `.indexOn` rules in `database.rules.json` for fields used in queries (e.g., `.indexOn: "createdAt"` added to `/generatedImages/$uid` for efficient retrieval of recent images).
