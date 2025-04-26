# Pets-On-Things

Turn photos of **any animal** (pets, wildlife, insects!) into fun, AI-generated images! Upload pictures, manage profiles for your favorite creatures, choose a style or describe your own, and let AI create unique artwork. This project aims to be a delightful way to celebrate **all animals**, **with the long-term goal of supporting animal welfare and conservation causes through potential merchandise sales.**

**(Phase 1 focuses on core image generation with persistent anonymous user data for animal profiles and photos.)**

## Tech Stack (Phase 1)

*   **Frontend:** React, TypeScript, Tailwind CSS, Vite
*   **Backend:** Python, FastAPI
*   **AI Service:** OpenAI API (`gpt-image-1`)
*   **Database:** PostgreSQL (or similar relational DB for **Animal Profile/Photo data**)
*   **Image Storage:** Cloud storage solution (e.g., AWS S3, Google Cloud Storage)
*   **Persistence:** Anonymous User ID via Browser Local Storage

*Future considerations include potentially using Firebase for Auth, Functions, and Database.*

## Getting Started

*(Instructions to be added: cloning, installing dependencies, setting up environment variables for backend (DB, Image Storage, OpenAI API Key), running the development servers.)*

---
*This project follows the workflow inspired by the [wasp-lang/vibe-coding-video](https://github.com/wasp-lang/vibe-coding-video).*
*Project planning documents: [PRD.md](PRD.md), [SOFTWARE.md](SOFTWARE.md), [UI.md](UI.md)*
*Implementation Tasks: [TASKS.md](TASKS.md)* 