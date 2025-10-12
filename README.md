# Animals On Things

Turn photos of any animal (pets, wildlife, insects) into fun AI-generated images. Upload multiple pictures for each animal, choose a style or describe your own, and let AI create unique, cute, weird art.

## Demo: https://animals.roytown.net/

<img width="600" alt="image" src="https://github.com/user-attachments/assets/bebac060-dd88-4bab-befd-28988c47fe88" />
<img width="600" alt="image" src="https://github.com/user-attachments/assets/a58a35c3-b07d-4761-8fb0-7e30150e320a" />

**Current Features:**
*   Email link login
*   Animal profile creation and management
*   Photo uploads for profiles
*   AI Image Generation based on selected photos, styles, and prompts
*   Image history gallery with download and delete functionality
*   Robust handling for image generation, even with mobile network interruptions

Future plans include automated daily themed images and merchandise printing. This project aims to be a delightful way to celebrate all animals, with the long term goal of supporting animal welfare and conservation causes through potential merchandise sales.

**(Phase 1 focuses on core image generation with persistent user data for animal profiles and photos.)**

## Tech Stack (Phase 1)

*   **Frontend:** React, TypeScript, Tailwind CSS, Vite
*   **Backend Platform:** Firebase
    *   **Hosting:** Firebase Hosting
    *   **Database:** **Realtime Database**
    *   **Storage:** Firebase Cloud Storage
    *   **Functions:** Firebase Cloud Functions (Node.js/TypeScript)
    *   **Authentication:** Firebase Authentication (Email Link)
*   **AI Service:** OpenAI API (`gpt-image-1` via `images.edit` endpoint)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/animals-on-things.git
   cd animals-on-things
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install functions dependencies
   cd ../functions
   npm install
   ```

3. **Tailwind CSS v4 Configuration**
   The project uses Tailwind CSS v4, which requires specific configuration:

   - The frontend directory has its own PostCSS config (`frontend/postcss.config.mjs`) which uses `@tailwindcss/postcss` (not the old `tailwindcss` plugin)
   - The main CSS file (`frontend/src/index.css`) uses the new import syntax: `@import "tailwindcss";` instead of the older `@tailwind` directives
   - If you need to modify Tailwind configuration, do so in CSS files using the `@theme` directive, as Tailwind v4 uses CSS-based configuration

4. **Set up Firebase**
   - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login to Firebase: `firebase login`
   - Initialize Firebase in the project: `firebase init`
   - Set environment variables for Cloud Functions (e.g., OpenAI API Key)
     - For the `generateImage` function, you need to set the `OPENAI_API_KEY` environment variable. You can do this locally by creating a `.env` file in the `functions` directory (`functions/.env`) with the line:
       ```
       OPENAI_API_KEY=your_openai_api_key_here
       ```
     - For deployment, set the secret using the `firebase functions:secrets:set` command (recommended) or configure it in the Google Cloud Console.
   - **Grant Permissions for Signed URLs (Required for `generateImage` function):**
     - The Cloud Function's service account needs permission to create signed URLs for Firebase Storage.
     - Grant the **Service Account Token Creator** role (`roles/iam.serviceAccountTokenCreator`) to the function's service account (usually `YOUR_PROJECT_ID@appspot.gserviceaccount.com` for 1st gen functions).
     - Run the following command, replacing `YOUR_PROJECT_ID` with your actual project ID:
       ```bash
       gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
           --member="serviceAccount:YOUR_PROJECT_ID@appspot.gserviceaccount.com" \
           --role="roles/iam.serviceAccountTokenCreator"
       ```
   - **Configure Frontend Region (Required for Functions):**
     - The frontend explicitly specifies `us-central1` as the region for functions.
     - If your functions are deployed to a different region, update this in `frontend/src/firebase.ts`.

5. **Important Notes on Image Generation:**
   - The `generateImage` function has an extended timeout (540 seconds, the maximum allowed) because image generation can be a time-consuming operation.
   - The frontend client also has a matching timeout configuration in `useImageGeneration.ts`.
   - If you experience CORS errors in development, ensure the explicit region set in `firebase.ts` matches your deployed function region.

6. **Run the development server**
   ```bash
   # In the root directory
   npm run dev  # This starts both Firebase emulators and the frontend dev server

   # Or run just the frontend
   cd frontend
   npm run dev
   ```

7. **Deployment**
   ```bash
   # Deploy everything
   npm run deploy

   # Or deploy specific parts
   npm run deploy:functions
   npm run deploy:hosting
   npm run deploy:rules
   ```

---
*This project follows the workflow inspired by the [wasp-lang/vibe-coding-video](https://github.com/wasp-lang/vibe-coding-video).*
*Project planning documents: [PRD.md](PRD.md), [SOFTWARE.md](SOFTWARE.md), [UI.md](UI.md)*
*Implementation Tasks: [TASKS.md](TASKS.md)*
