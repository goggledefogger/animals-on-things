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
- [x] **Implement Anonymous Authentication (Frontend)**
  - [x] Integrate Firebase SDK into the React app (`npm install firebase`, `src/firebase.ts`).
  - [x] Implement logic to sign in user anonymously on app load (`frontend/src/App.tsx`).
  - [x] Manage and provide user state (`uid`) to components (via `AuthContext`).
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

## In Progress Tasks

- [x] **Implement Image Generation Cloud Function (`generateImage`)**
  - [x] Setup Cloud Function project (`functions/src/index.ts`).
  - [x] Add necessary dependencies (`firebase-admin`, `firebase-functions`, `openai`).
  - [x] Implement HTTPS callable function:
    - [x] Verify user auth token (`context.auth`).
    - [x] Adapt to receive `selections: [{ profileId, photoId }, ...]` in request body.
    - [x] Retrieve *multiple* photo details (name, path) from Firebase **Realtime Database** based on `selections`.
    - [x] Formulate a combined text prompt incorporating selected animals (by name) and user input.
    - [x] **Call OpenAI `gpt-image-1` API** (manage API key via `.env` -> `process.env.OPENAI_API_KEY`).
      - Use official `openai` Node.js library (`openai.images.generate`).
      - Specify `model: "gpt-image-1"`.
      - Pass `prompt`, `n: 1`, `size: "1024x1024"`, `quality: "high"`.
      - Pass `user: uid` for monitoring (as per OpenAI docs).
      - *Note:* Do not use `response_format: "url"` (caused errors with this model).
    - [x] Handle OpenAI response/errors (check for data, parse error messages).
    - [x] **Store generated image metadata** in Realtime Database (`/generatedImages/{uid}`).
    - [x] Return generated image URL (currently the direct OpenAI URL).
  - [ ] Implement basic rate limiting (e.g., using **Realtime Database** to track user generations).
- [ ] **Implement Image Generation Frontend Integration** (Continued)
  - [ ] UI Component: Display generated image from URL.
  - [ ] UI Component: Download button for generated image.
  - [ ] UI Component: Session gallery for recently generated images (client-side state).
- [ ] **Refinement & Styling** (Continued)
  - [ ] Apply playful & simple theme based on `UI.md` using Tailwind.
  - [ ] Add loading indicators and error handling feedback (for Firebase operations & Function calls).
  - [ ] Ensure copy and visual tone align with the dual mission of fun creativity and animal welfare/conservation support.
- [ ] **Testing**
  - [ ] Write basic tests for Cloud Functions (using emulators/mocks).
  - [ ] Write basic frontend component tests.
- [ ] **Deployment**
  - [x] Deploy **Realtime Database**/Storage security rules.
  - [x] Deploy Cloud Functions (`firebase deploy --only functions`).
  - [x] Build and deploy frontend app to Firebase Hosting (`firebase deploy --only hosting`).
  - [ ] Re-enable linting in `firebase.json` predeploy hooks after addressing max-len issues.

## Implementation Plan (Revised)

1.  **Firebase Setup:** Create project, initialize locally (**Database**, Functions, Storage, Hosting, Emulators), configure basic security rules.
2.  **Authentication:** Implement frontend anonymous login using Firebase Auth SDK.
3.  **Core Realtime Database/Storage CRUD:** Implement frontend UI and logic for creating/reading/deleting Animal Profiles and Photos (direct SDKs).
4.  **Refactor Generation Flow:** Modify frontend state (`App.tsx`), profile selection (`AnimalProfileList`), photo selection (`SelectedPhotosPanel`, `PhotoThumbnail`), and generation panel (`ImageGenerationPanel`) for multi-select UX.
5.  **Cloud Function:** Implement the `generateImage` Cloud Function, adapting it to handle multiple inputs.
6.  **Refinement & Styling:** Apply theme, add loading/error states, ensure responsiveness and brand alignment.
7.  **Testing & Deployment:** Write tests, deploy rules, functions, and hosting.

### Relevant Files

*(To be populated as development progresses)*
- `PRD.md` - Product Requirements Document
- `SOFTWARE.md` - Software Requirements Specification
- `UI.md` - User Interface Description Document
- `README.md` - Project Overview
- `TASKS.md` - Implementation Tasks (this file)
- `frontend/` - React application code
  - `frontend/src/App.tsx` - Main application component, orchestrates multi-select profile/photo view ✅ (Refactored)
  - `frontend/src/main.tsx` - Application entry point, wraps App with AuthProvider ✅
  - `frontend/src/firebase.ts` - Firebase configuration and initialization ✅ (Uses .env)
  - `frontend/.env` - Firebase configuration values (Gitignored) ✅
  - `frontend/.env.example` - Template for Firebase environment variables ✅ (New)
  - `frontend/src/contexts/AuthContext.tsx` - React context for authentication state ✅
  - `frontend/src/types/AnimalProfile.ts` - TypeScript type for Animal Profile ✅
  - `frontend/src/types/AnimalPhoto.ts` - TypeScript type for Animal Photo ✅
  - `frontend/src/hooks/useAnimalProfiles.ts` - Hook for fetching and managing animal profiles ✅
  - `frontend/src/hooks/useAnimalPhotos.ts` - Hook for fetching photos for a profile ✅
  - `frontend/src/components/features/AnimalProfileList.tsx` - Component to display/select/delete animal profiles ✅ (Refactored for multi-select)
  - `frontend/src/components/features/AddAnimalProfileForm.tsx` - Component to add new animal profiles ✅ (Responsiveness improved)
  - `frontend/src/components/features/PhotoGallery.tsx` - Component to display photos for selected profile ✅ (Responsiveness improved) - *Role may change*
  - `frontend/src/components/features/AnimalPhotoItem.tsx` - Component to display a single photo from storage ✅ - *May be replaced by PhotoThumbnail*
  - `frontend/src/components/features/PhotoUploader.tsx` - Component to handle photo uploads ✅ (Integrated into SelectedPhotosPanel)
  - `frontend/src/components/features/ImageGenerationPanel.tsx` - Component for image generation controls ✅ (Refactored for multi-select)
  - `frontend/src/components/features/SelectedPhotosPanel.tsx` - Component for selecting photos per profile ✅ (New, includes Uploader)
  - `frontend/src/components/common/Card.tsx` - Reusable Card component ✅ (Styling updated)
  - `frontend/src/components/common/Button.tsx` - Reusable Button component ✅
  - `frontend/src/components/common/Input.tsx` - Reusable Input component ✅
  - `frontend/src/components/common/PhotoThumbnail.tsx` - Component to display image from storage path ✅ (New)
- `functions/` - Firebase Cloud Functions code
- `firestore.rules` - Firestore security rules
- `database.rules.json` - **Realtime Database** security rules
- `storage.rules` - Cloud Storage security rules ✅ (Path fixed)
- `firebase.json` - Firebase project configuration
- `.firebaserc` - Firebase project alias configuration
- `package.json` - Root package file (for scripts like `npm run dev`)
- `.gitignore` - Specifies intentionally untracked files ✅ (Updated)
- `cors.json` - Configuration for Cloud Storage CORS ✅ (New)

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