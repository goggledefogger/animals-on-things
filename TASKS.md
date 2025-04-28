# Animals-On-Things Phase 1 Implementation (Firebase Backend)

Implement the core functionality for users to manage Animal Profiles, upload photos, and generate AI images using OpenAI, leveraging **Firebase** for backend services (Auth, **Realtime Database**, Storage, Functions, Hosting).

## Completed Tasks

- [x] Define Product Requirements (`PRD.md`)
- [x] Define Software Requirements (`SOFTWARE.md`)
- [x] Define UI Description (`UI.md`)
- [x] Create initial `README.md`
- [x] Create initial `TASKS.md`
- [x] Setup Frontend Project Structure (React/TS/Vite/Tailwind)
  - [x] Initialize Vite project with React & TypeScript template (`frontend/`)
  - [x] Install and configure Tailwind CSS
- [x] **Setup Firebase Project & Local Emulators**
  - [x] Create Firebase project in the console.
  - [x] Install Firebase CLI (`npm install -g firebase-tools`).
  - [x] Login to Firebase CLI (`firebase login`).
  - [x] Initialize Firebase project locally (`firebase init` ran, created `functions`, `database.rules.json`, `storage.rules`).
  - [x] Configure Functions (TypeScript/Node.js setup in `functions/`).
  - [x] Configure local emulators (`firebase.json` created manually).
  - [x] Created `.firebaserc` manually.
- [x] **Implement Firebase Security Rules**
  - [x] Define initial **Realtime Database** rules (`database.rules.json`) to allow authenticated users to read/write their own data (Profiles, Photos).
  - [x] Define initial Storage rules (`storage.rules`) to allow authenticated users to upload/delete their own photos.
  - [x] Fix Storage rules path mismatch (`/user/` vs `/profiles/`).
- [x] **Setup Simplified Dev Start**
  - [x] Created root `package.json`.
  - [x] Installed `concurrently`.
  - [x] Added `npm run dev` script to start emulators and frontend.
- [x] **Implement Email Link Authentication (Frontend)**
- [x] **Implement Animal Profile Management (Frontend & Realtime Database)**
  - [x] Frontend: UI Component to display list of Animal Profiles (read from Realtime Database using `uid`).
  - [x] Frontend: UI Component to create a new Animal Profile (write to Realtime Database, associated with `uid`).
  - [x] Frontend: UI Component to delete an Animal Profile (delete from Realtime Database).
- [x] **Implement Animal Photo Management (Frontend & Storage/Realtime Database)**
  - [x] Frontend: UI Component to display photo gallery for a selected Animal Profile (read photo metadata from Realtime Database).
    - [x] Handle profile selection (refactored to multi-select in `App.tsx`).
    - [x] Create hook to fetch photo metadata (`useAnimalPhotos`).
    - [x] Create `PhotoGallery` component (displays placeholder) - *Note: Role may change with new UX*
    - [x] Render actual images from Storage (via `PhotoThumbnail`).
    - [x] Add photo delete button UI (`AnimalPhotoItem`).
    - [x] Implement photo delete logic (Storage & Realtime Database) (`PhotoGallery`).
    - [x] Add photo selection mechanism (Refactored to `SelectedPhotosPanel`).
  - [x] Frontend: UI Component to upload photos to Firebase Storage (associated with selected Profile & `uid`). Store metadata (storagePath) in Realtime Database (`PhotoUploader`).
  - [x] Fix Storage CORS configuration (`cors.json`, `gsutil`).
  - [x] Fix Storage permissions error (`storage/unauthorized`) by correcting rule path.
- [x] **Refinement & Styling** (Partially Complete)
  - [x] Ensure responsiveness across devices.
  - [x] Improve layout spacing and card styling.
- [x] **Refactor Image Generation Flow (Frontend)**
  - [x] Update state management in `App.tsx` for multi-select profiles and photos.
  - [x] Update `AnimalProfileList.tsx` for multi-select UI and logic.
  - [x] Create `PhotoThumbnail.tsx` component to display images from storage path.
  - [x] Create `SelectedPhotosPanel.tsx` component for selecting one photo per chosen profile.
  - [x] Integrate `SelectedPhotosPanel` into `App.tsx`.
  - [x] Update `ImageGenerationPanel.tsx` props and UI to accept multiple selections.
  - [x] Integrate `PhotoUploader.tsx` into `SelectedPhotosPanel.tsx`.
- [x] **Environment Configuration**
  - [x] Move Firebase config from `firebase.ts` to `.env` file using Vite prefixes.
  - [x] Add `.env.example` template.
  - [x] Update `.gitignore` to ignore `frontend/.env`.
- [x] **Implement Image Generation Cloud Function (`generateImage`)**
  - [x] Setup Cloud Function project (`functions/src/index.ts`).
  - [x] Add necessary dependencies (`firebase-admin`, `firebase-functions`, `openai`).
  - [x] Implement HTTPS callable function:
    - [x] Verify user auth token (`context.auth`).
    - [x] Adapt to receive `selections: [{ profileId, photoId }, ...]` in request body.
    - [x] Retrieve *multiple* photo details (name, path) from Firebase **Realtime Database** based on `selections`.
    - [x] Formulate a combined text prompt incorporating selected animals (by name) and user input.
    - [x] **Call OpenAI `gpt-image-1` API** (manage API key via `.env` -> `process.env.OPENAI_API_KEY`).
      - Use official `openai` Node.js library (`openai.images.edit`).
      - Specify `model: "gpt-image-1"`.
      - Pass `prompt`, `n: 1`, `size: "1024x1024"`.
      - Pass `user: uid` for monitoring (as per OpenAI docs).
      - Avoid using `response_format` parameter with `gpt-image-1` model.
    - [x] Handle OpenAI response/errors (check for data, parse error messages).
    - [x] **Store generated image metadata** in Realtime Database (`/generatedImages/{uid}`).
    - [x] Return generated image URL (currently the direct OpenAI URL).
  - [x] Increase function timeout to handle longer image generation requests.
  - [x] Fix client-side timeout to match function timeout.
  - [x] Ensure proper CORS handling by explicitly configuring region.
  - [x] Add logo image next to title text.
  - [x] Generate and integrate favicon using logo (via `/public` directory and `index.html`).
- [x] **Implement Image History Gallery**
  - [x] Frontend component (`ImageHistoryGallery.tsx`) to display generated images from RTDB using `useImageHistory` hook.
  - [x] Add Download button functionality.
  - [x] **Add Delete button functionality:** ✅
    - [x] Created `deleteHistoryImage` Cloud Function (RTDB record + Storage file deletion).
    - [x] Created `useImageHistoryDeletion` frontend hook.
    - [x] Added Delete button UI and confirmation to `ImageHistoryGallery.tsx`.
- [x] **Implement Email Link Authentication**
  - [x] Replace Anonymous Auth with Email Link (`LoginPage.tsx`, `FinishLoginPage.tsx`).
  - [x] Update `AuthContext` and `ProtectedRoutes`.
  - [x] Add Sign Out button.
  - [x] Configure Auth domain whitelisting in Firebase Console.
  - [x] Configure email link URL via environment variables (`.env`, `.env.production`).
- [x] **Robust Image Generation Status Handling** ✅
  - [x] Utilize RTDB listener (`onValue` in `useImageGeneration.ts`) as the primary source of truth for generation completion, matching via `requestId`.
  - [x] Handle specific client-side `httpsCallable` errors (`deadline-exceeded`, `unavailable`, `cancelled`, `internal`) as potentially recoverable without immediately showing a UI error, allowing the listener to confirm success.
  - [x] Implement a client-side safety timeout (`CLIENT_SIDE_TIMEOUT_MS`) to show an error if the listener doesn't confirm success within a reasonable period.

## In Progress Tasks

- [ ] **Refinement & Styling** (Continued)
  - [ ] Apply playful & simple theme based on `UI.md` using Tailwind.
  - [ ] Add more comprehensive loading indicators and error handling feedback (beyond current state).
  - [ ] Ensure copy and visual tone align with the dual mission of fun creativity and animal welfare/conservation support.
  - [ ] **UI Cleanup:** Review button variants, spinner usage consistency.
- [ ] **Implement Rate Limiting**
  - [ ] Basic rate limiting (e.g., using **Realtime Database** to track user generations).

## Future Tasks

- [ ] **Testing**
  - [ ] Write basic tests for Cloud Functions (using emulators/mocks).
  - [ ] Write basic frontend component tests.
- [ ] **Deployment**
  - [x] Deploy **Realtime Database**/Storage security rules.
  - [x] Deploy Cloud Functions (`firebase deploy --only functions`).
  - [x] Build and deploy frontend app to Firebase Hosting (`firebase deploy --only hosting`).
  - [ ] Re-enable linting in `firebase.json` predeploy hooks after addressing max-len issues.

## Implementation Plan (Revised)

1.  **Firebase Setup:** Create project, initialize locally (**Database**, Functions, Storage, Hosting, Emulators), configure basic security rules. ✅
2.  **Authentication:** Implement frontend Email Link login using Firebase Auth SDK. ✅
3.  **Core Realtime Database/Storage CRUD:** Implement frontend UI and logic for creating/reading/deleting Animal Profiles and Photos (direct SDKs). ✅
4.  **Refactor Generation Flow:** Modify frontend state, profile selection, photo selection, and generation panel for multi-select UX. ✅
5.  **Cloud Function:** Implement the `generateImage` Cloud Function. ✅
6.  **Image History:** Implement gallery display (`ImageHistoryGallery.tsx`) and deletion (`deleteHistoryImage` function). ✅
7.  **Robust Generation Status:** Implement listener-based status handling in `useImageGeneration.ts`. ✅
8.  **Refinement & Styling:** Apply theme, add loading/error states, ensure responsiveness and brand alignment. **⏳ In Progress**
9.  **Testing & Deployment:** Write tests, deploy rules, functions, and hosting.

### Relevant Files

- `PRD.md` - Product Requirements Document ✅
- `SOFTWARE.md` - Software Requirements Specification ✅
- `UI.md` - User Interface Description Document ✅
- `README.md` - Project Overview ✅
- `TASKS.md` - Implementation Tasks (this file) ✅
- `frontend/` - React application code
  - `frontend/src/App.tsx` - Main application component, routing, core layout ✅
  - `frontend/src/main.tsx` - Application entry point, wraps App with AuthProvider ✅
  - `frontend/src/firebase.ts` - Firebase configuration and initialization ✅
  - `frontend/.env` - Local Firebase configuration values (Gitignored) ✅
  - `frontend/.env.production` - Production Firebase configuration values (Gitignored) ✅
  - `frontend/.env.example` - Template for Firebase environment variables ✅
  - `frontend/src/contexts/AuthContext.tsx` - React context for authentication state ✅
  - `frontend/src/types/AnimalProfile.ts` - TypeScript type for Animal Profile ✅
  - `frontend/src/types/AnimalPhoto.ts` - TypeScript type for Animal Photo ✅
  - `frontend/src/hooks/useAnimalProfiles.ts` - Hook for fetching and managing animal profiles ✅
  - `frontend/src/hooks/useAnimalPhotos.ts` - Hook for fetching photos for a profile ✅
  - `frontend/src/hooks/useImageGeneration.ts` - Hook for calling generation function and handling status via listener ✅
  - `frontend/src/hooks/usePhotoDeletion.ts` - Hook for deleting animal profile photos ✅
  - `frontend/src/hooks/useImageHistory.ts` - Hook for fetching generated image history ✅
  - `frontend/src/hooks/useImageHistoryDeletion.ts` - Hook for deleting generated image history items ✅
  - `frontend/src/components/auth/LoginPage.tsx` - Email link login page ✅
  - `frontend/src/components/auth/FinishLoginPage.tsx` - Page to complete email link sign-in ✅
  - `frontend/src/components/auth/ProtectedRoutes.tsx` - Protects routes requiring authentication ✅
  - `frontend/src/components/features/AnimalProfilesPanel.tsx` - Panel for profile list and adding ✅
  - `frontend/src/components/features/AnimalProfileList.tsx` - Component to display/select/delete animal profiles ✅
  - `frontend/src/components/features/AddAnimalProfileForm.tsx` - Component to add new animal profiles ✅
  - `frontend/src/components/features/WorkspacePanel.tsx` - Container for selection/generation panels ✅
  - `frontend/src/components/features/SelectedPhotosPanel.tsx` - Component for selecting photos per profile ✅
  - `frontend/src/components/features/MiniPhotoGallery.tsx` - Displays thumbnails within SelectedPhotosPanel ✅
  - `frontend/src/components/features/PhotoUploader.tsx` - Component to handle photo uploads ✅
  - `frontend/src/components/features/ImageGenerationPanel.tsx` - Component for image generation controls ✅
  - `frontend/src/components/features/ImageHistoryGallery.tsx` - Component to display generated image history with download/delete ✅
  - `frontend/src/components/common/Card.tsx` - Reusable Card component ✅
  - `frontend/src/components/common/Button.tsx` - Reusable Button component ✅
  - `frontend/src/components/common/Input.tsx` - Reusable Input component ✅
  - `frontend/src/components/common/Textarea.tsx` - Reusable Textarea component ✅
  - `frontend/src/components/common/Spinner.tsx` - Reusable Spinner component ✅
- `functions/` - Firebase Cloud Functions code
  - `functions/src/index.ts` - Exports all cloud functions ✅
  - `functions/src/generateImage.ts` - Image generation function ✅
  - `functions/src/deletePhoto.ts` - Animal profile photo deletion function ✅
  - `functions/src/getImageHistory.ts` - Function to fetch generated image history ✅
  - `functions/src/deleteHistoryImage.ts` - Function to delete generated image history items ✅
- `database.rules.json` - **Realtime Database** security rules ✅
- `storage.rules` - Cloud Storage security rules ✅
- `firebase.json` - Firebase project configuration ✅
- `.firebaserc` - Firebase project alias configuration ✅
- `package.json` - Root package file (for scripts) ✅
- `.gitignore` - Specifies intentionally untracked files ✅
- `cors.json` - Configuration for Cloud Storage CORS ✅

## Future Tasks (Phase 2 - Merchandise & Accounts)

- [ ] **Implement Full User Authentication**
  - [ ] Upgrade Firebase Auth to support Email/Password or Social Logins.
  - [ ] Frontend: Implement login/signup UI.
  - [ ] Link anonymous data to permanent accounts if needed.
- [ ] **Merchandise Integration (e.g., Printify)**
  - [ ] Backend: Integrate Printify API client (or similar Print-on-Demand service).
  - [ ] Backend: API endpoints to fetch available product types/templates.
  - [ ] Backend: Logic to place generated images onto product mockups via API.
  - [ ] Frontend: UI to browse merchandise categories (T-shirts, Mugs, etc.).
  - [ ] Frontend: UI to display generated image preview on selected merchandise.
  - [ ] Frontend: UI to select product options (size, color, etc.).
- [ ] **Basic Ordering Flow**
  - [ ] Frontend: Simple cart or checkout initiation (might initially link out to Printify or be a placeholder).
  - [ ] Backend: API endpoint to initiate order creation process with Printify.
- [ ] **Enhanced Gallery & Sharing**
  - [ ] Persistent gallery tied to user accounts.
  - [ ] Basic sharing functionality (e.g., share image URL).

## Future Tasks (Phase 3 - Production & Growth Ideas)

- [ ] **Full E-commerce Implementation**
  - [ ] Integrate payment processing (e.g., Stripe).
  - [ ] Implement full checkout flow within the app.
  - [ ] User order history and tracking.
  - [ ] Backend order fulfillment logic/webhooks with Printify.
- [ ] **Admin Interface**
  - [ ] Basic dashboard for managing users, products, potentially orders.
- [ ] **Supporting Animal Welfare**
  - [ ] Partner with specific charities **(including welfare, rescue, and conservation organizations)**.
  - [ ] Implement logic/UI to track and display donations per purchase.
  - [ ] Feature charity partners in the UI.
- [ ] **Automated Daily Images**
  - [ ] Setup Cloud Scheduler job to trigger daily function.
  - [ ] Implement `dailyImageGenerator` Cloud Function:
    - Fetch opted-in users.
    - Call LLM to determine daily theme.
    - Select user animal photo(s).
    - Call Image Generation API with theme + photo.
    - Store result in Realtime Database.
    - (Optional) Send notification (FCM).
  - [ ] Frontend: Implement UI for user opt-in/out preference.
  - [ ] Frontend: Implement UI to display daily generated image(s).
  - [ ] Frontend: Implement UI to view history of daily images.
  - [ ] Add robust error handling and cost monitoring/limits for this feature.
- [ ] **Advanced AI / Customization**
  - [ ] More granular style controls.
  - [ ] Negative prompts.
  - [ ] Allow users to save favorite prompts/styles.
  - [ ] Explore alternative AI models or fine-tuning.
- [ ] **Community Features**
  - [ ] Option to share creations publicly.
  - [ ] User profiles.
  - [ ] Like/comment system.
- [ ] **Production Readiness**
  - [ ] Robust monitoring, logging, and alerting.
  - [ ] Scalable infrastructure design (load balancing, DB scaling, etc.).
  - [ ] Comprehensive testing (end-to-end, performance).
  - [ ] Security hardening.
  - [ ] CI/CD pipeline automation.
