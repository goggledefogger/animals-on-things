# Animals-On-Things

Turn photos of **any animal** (pets, wildlife, insects!) into fun, AI-generated images! Upload pictures, manage profiles for your favorite creatures, choose a style or describe your own, and let AI create unique artwork. Future plans include **automated daily themed images** and merchandise options. This project aims to be a delightful way to celebrate **all animals**, **with the long-term goal of supporting animal welfare and conservation causes through potential merchandise sales.**

**(Phase 1 focuses on core image generation with persistent anonymous user data for animal profiles and photos.)**

## Tech Stack (Phase 1)

*   **Frontend:** React, TypeScript, Tailwind CSS, Vite
*   **Backend Platform:** Firebase
    *   **Hosting:** Firebase Hosting
    *   **Database:** **Realtime Database**
    *   **Storage:** Firebase Cloud Storage
    *   **Functions:** Firebase Cloud Functions (Node.js/TypeScript recommended)
    *   **Authentication:** Firebase Authentication (Anonymous)
*   **AI Service:** OpenAI API (`gpt-image-1`)

## Getting Started

*(Instructions to be added: cloning, installing dependencies (`npm install` in `frontend/` and `functions/`), setting up Firebase project, configuring Firebase CLI, setting environment variables for Cloud Functions (e.g., OpenAI API Key), deploying Functions/Hosting, running frontend dev server (`npm run dev` in `frontend/`)).*

---
*This project follows the workflow inspired by the [wasp-lang/vibe-coding-video](https://github.com/wasp-lang/vibe-coding-video).*
*Project planning documents: [PRD.md](PRD.md), [SOFTWARE.md](SOFTWARE.md), [UI.md](UI.md)*
*Implementation Tasks: [TASKS.md](TASKS.md)* 