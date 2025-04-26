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
- [x] **Setup Simplified Dev Start**
  - [x] Created root `package.json`.
  - [x] Installed `concurrently`.
  - [x] Added `npm run dev` script to start emulators and frontend.
- [x] **Implement Anonymous Authentication (Frontend)**
  - [x] Integrate Firebase SDK into the React app (`npm install firebase`, `src/firebase.ts`).
  - [x] Implement logic to sign in user anonymously on app load (`frontend/src/App.tsx`).
  - [x] Manage and provide user state (`uid`) to components (via `AuthContext`).

## In Progress Tasks

- [x] **Implement Animal Profile Management (Frontend & Realtime Database)**
  - [x] Frontend: UI Component to display list of Animal Profiles (read from Realtime Database using `uid`).
  - [x] Frontend: UI Component to create a new Animal Profile (write to Realtime Database, associated with `uid`).
  - [ ] Frontend: UI Component to delete an Animal Profile (delete from Realtime Database).
- [ ] **Implement Animal Photo Management (Frontend & Storage/Realtime Database)**
  - [ ] Frontend: UI Component to display photo gallery for a selected Animal Profile (read photo metadata from Realtime Database).
  - [ ] Frontend: UI Component to upload photos to Firebase Storage (associated with selected Profile & `uid`). Store metadata (storagePath) in Realtime Database.
  - [ ] Frontend: UI Component to select a photo for generation.
  - [ ] Frontend: UI Component to delete a photo (delete from Storage and Realtime Database).
- [ ] **Implement Image Generation Cloud Function (`generateImage`)**
  - [ ] Setup Cloud Function project (e.g., `functions/src/index.ts` if using TS).
  - [ ] Add necessary dependencies (`firebase-admin`, `firebase-functions`, `openai`, etc.).
  - [ ] Implement HTTPS callable function:
    - Verify user auth token (`context.auth`).
    - Get photo details (e.g., storage path from **Realtime Database** using photo key) from request body.
    - Retrieve image from Firebase Storage.
    - Call OpenAI `gpt-image-1` API (manage API key via env config).
    - Handle OpenAI response/errors.
    - Return generated image URL or data.
  - [ ] Implement basic rate limiting (e.g., using **Realtime Database** to track user generations).
- [ ] **Implement Image Generation Frontend Integration**
  - [ ] UI Component: Style selector (predefined options).
  - [ ] UI Component: Custom prompt input field.
  - [ ] UI Component: "Generate" button (calls the `generateImage` Cloud Function).
  - [ ] UI Component: Display generated image result.
  - [ ] UI Component: Download button for generated image.
  - [ ] UI Component: Session gallery for recently generated images (client-side state).
- [ ] **Refinement & Styling**
  - [ ] Apply playful & simple theme based on `UI.md` using Tailwind.
  - [ ] Add loading indicators and error handling feedback (for Firebase operations & Function calls).
  - [ ] Ensure responsiveness across devices.
  - [ ] Ensure copy and visual tone align with the dual mission of fun creativity and animal welfare/conservation support.
- [ ] **Testing**
  - [ ] Write basic tests for Cloud Functions (using emulators/mocks).
  - [ ] Write basic frontend component tests.
- [ ] **Deployment**
  - [ ] Deploy **Realtime Database**/Storage security rules.
  - [ ] Deploy Cloud Functions (`firebase deploy --only functions`).
  - [ ] Build and deploy frontend app to Firebase Hosting (`firebase deploy --only hosting`).

## Implementation Plan

1.  **Firebase Setup:** Create project, initialize locally (**Database**, Functions, Storage, Hosting, Emulators), configure basic security rules.
2.  **Authentication:** Implement frontend anonymous login using Firebase Auth SDK.
3.  **Core Realtime Database/Storage CRUD:** Implement frontend UI and logic for creating/reading/deleting Animal Profiles and Photos, interacting directly with Realtime Database and Storage SDKs.
4.  **Cloud Function:** Implement the `generateImage` Cloud Function to handle OpenAI interaction.
5.  **Frontend Integration:** Connect frontend UI (style/prompt selection, generate button) to call the Cloud Function and display results.
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
  - `frontend/src/App.tsx` - Main application component, uses AuthContext ✅
  - `frontend/src/main.tsx` - Application entry point, wraps App with AuthProvider ✅
  - `frontend/src/firebase.ts` - Firebase configuration and initialization ✅
  - `frontend/src/contexts/AuthContext.tsx` - React context for authentication state ✅
  - `frontend/src/types/AnimalProfile.ts` - TypeScript type for Animal Profile ✅
  - `frontend/src/hooks/useAnimalProfiles.ts` - Hook for fetching and adding animal profiles ✅
  - `frontend/src/components/features/AnimalProfileList.tsx` - Component to display animal profiles ✅
  - `frontend/src/components/features/AddAnimalProfileForm.tsx` - Component to add new animal profiles ✅
- `functions/` - Firebase Cloud Functions code (e.g., Node.js/TypeScript)
- `firestore.rules` - Firestore security rules
- `database.rules.json` - **Realtime Database** security rules
- `storage.rules` - Cloud Storage security rules
- `firebase.json` - Firebase project configuration
- `.firebaserc` - Firebase project alias configuration
- `package.json` - Root package file (for scripts like `npm run dev`)

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