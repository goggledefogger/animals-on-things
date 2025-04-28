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
  - [x] Initial implementation with `LoginPage.tsx`, `FinishLoginPage.tsx`, `AuthContext`, `ProtectedRoutes`.
  - [x] Add Sign Out button.
  - [x] Configure Auth domain whitelisting.
  - [x] Configure email link URL via `.env` files (`VITE_APP_BASE_URL`).
  - [x] Debug `auth/unauthorized-continue-uri` error (verified `.env.production` and console settings).
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
  - [x] **Header Logo Adjustments:** ✅
    - [x] Adjusted logo height to match text while maintaining aspect ratio (`h-`, `w-auto`).
    - [x] Increased base mobile height (`h-12`).
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
  - [x] Frontend component (`ImageHistoryGallery.tsx`) to display generated images.
  - [x] Add Download button functionality.
  - [x] **Add Delete button functionality:** ✅
    - [x] Created `deleteHistoryImage` Cloud Function.
    - [x] Created `useImageHistoryDeletion` frontend hook.
    - [x] Added Delete button UI and confirmation.
  - [x] **Image Display:** ✅
    - [x] Implemented letterboxing/pillarboxing (`object-contain`) for history images to fit container without cropping.
- [x] **Robust Image Generation Status Handling** ✅
  - [x] Utilize RTDB listener (`onValue` in `useImageGeneration.ts`) as the primary source of truth for generation completion, matching via `requestId`.
  - [x] Implemented client-side safety timeout (`CLIENT_SIDE_TIMEOUT_MS`).
  - [x] **Mobile Screen-Off Fix:** Modified `catch` block in `useImageGeneration` to ignore specific recoverable client-side errors (like `internal`, `deadline-exceeded`, `unavailable`) from the initial `httpsCallable`, preventing temporary UI errors and allowing the listener to correctly update the state upon reconnection.

## In Progress Tasks

- [ ] **Refinement & Styling** (Continued)
  - [ ] Apply playful & simple theme based on `UI.md` using Tailwind.
  - [ ] Add more comprehensive loading indicators and error handling feedback.
  - [ ] Ensure copy and visual tone align with the dual mission.
  - [ ] **UI Cleanup:** Review button variants, spinner usage consistency.
- [ ] **Implement Rate Limiting**
  - [ ] Basic rate limiting.

## Future Tasks

- [ ] **Testing**
- [ ] **Deployment Refinements**
  - [ ] Address `functions: Unhandled error cleaning up build images` warning.
  - [ ] Re-enable linting in `firebase.json` predeploy hooks.

## Implementation Plan (Revised)

1.  Firebase Setup ✅
2.  Authentication (Email Link) ✅
3.  Core Realtime Database/Storage CRUD ✅
4.  Refactor Generation Flow ✅
5.  Cloud Function (`generateImage`) ✅
6.  Image History Gallery (Display, Download, Delete) ✅
7.  Robust Generation Status Handling (incl. Mobile Fix) ✅
8.  Refinement & Styling ⏳
9.  Testing & Deployment ⏳

### Relevant Files

- `PRD.md` ✅
- `SOFTWARE.md` ✅
- `UI.md` ✅
- `README.md` ✅
- `TASKS.md` ✅
- `frontend/src/App.tsx` ✅
- `frontend/src/hooks/useImageGeneration.ts` ✅
- `frontend/src/hooks/useImageHistoryDeletion.ts` ✅
- `frontend/src/components/auth/LoginPage.tsx` ✅
- `frontend/src/components/features/ImageHistoryGallery.tsx` ✅
- `functions/src/deleteHistoryImage.ts` ✅
- ... (other files previously listed remain relevant) ...

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
