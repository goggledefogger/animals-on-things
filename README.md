# Animals-On-Things

Turn photos of **any animal** (pets, wildlife, insects!) into fun, AI-generated images! Upload pictures, manage profiles for your favorite creatures, choose a style or describe your own, and let AI create unique artwork. Future plans include **automated daily themed images** and merchandise options. This project aims to be a delightful way to celebrate **all animals**, **with the long-term goal of supporting animal welfare and conservation causes through potential merchandise sales.**

**(Phase 1 focuses on core image generation with persistent anonymous user data for animal profiles and photos.)**

## Tech Stack (Phase 1)

*   **Frontend:** React, TypeScript, Tailwind CSS v4, Vite
*   **Backend Platform:** Firebase
    *   **Hosting:** Firebase Hosting
    *   **Database:** **Realtime Database**
    *   **Storage:** Firebase Cloud Storage
    *   **Functions:** Firebase Cloud Functions (Node.js/TypeScript recommended)
    *   **Authentication:** Firebase Authentication (Anonymous)
*   **AI Service:** OpenAI API (`gpt-image-1`)

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

5. **Run the development server**
   ```bash
   # In the root directory
   npm run dev  # This starts both Firebase emulators and the frontend dev server
   
   # Or run just the frontend
   cd frontend
   npm run dev
   ```

6. **Deployment**
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