# Software Requirements Specification: Pets-On-Things (Phase 1)

This document details the technical requirements for Phase 1, focusing on anonymous user persistence and core AI image generation. The project also aims to eventually incorporate features supporting animal welfare causes, which may influence future technical decisions regarding partnerships, donations, or specific feature integrations.

-   **System Design**
    -   Client-Server architecture.
    -   The client is a web-based Single Page Application (SPA) responsible for user interaction (uploading photos, selecting styles, displaying results).
    -   The server is a backend API responsible for handling image uploads, communicating with the external AI image generation service, and returning results to the client.

-   **Architecture pattern**
    -   **Frontend:** Single Page Application (SPA) using component-based architecture (React).
    -   **Backend:** RESTful API service.

-   **State management**
    -   **Frontend (Phase 1):** Primarily use React's built-in state management (e.g., `useState`, `useReducer`) for component-level state and potentially simple context for shared session state (like the temporary gallery). More complex state management (like Zustand or Redux) can be considered in later phases if needed.
    -   **Backend:** Stateless API. Session state (like the generated image gallery for anonymous users) will be managed client-side in Phase 1.

-   **Data flow**
    1.  User accesses the web application in their browser.
    2.  User uploads a pet photo via the frontend interface.
    3.  User selects a predefined style or enters a custom text prompt.
    4.  Frontend sends the image data (e.g., multipart/form-data) and the style/prompt information to the backend API endpoint.
    5.  Backend receives the request, temporarily stores/processes the image if necessary.
    6.  Backend constructs the appropriate request for the external OpenAI Image Generation API (`gpt-image-1`), including the *input image data* and the text prompt/style information.
    7.  Backend sends the request to the OpenAI API and awaits the response.
    8.  OpenAI API (`gpt-image-1`) processes the request and returns the generated image (likely as a URL or raw data).
    9.  Backend receives the generated image data/URL from the OpenAI API.
    10. Backend sends the generated image URL or data back to the frontend in the API response.
    11. Frontend receives the response and displays the generated image.
    12. Frontend adds the image (or its URL/thumbnail) to the temporary session gallery.
    13. User can click a button to download the image directly from the displayed result or its source URL.

-   **Technical Stack**
    -   **Frontend:** React, TypeScript, Tailwind CSS, Vite (as build tool, following the example repo pattern)
    -   **Backend:** Python, FastAPI
    -   **AI Service:** OpenAI API, specifically using the `gpt-image-1` model (powered by GPT-4o).
        -   *Note:* This API requires organization verification for access.
        -   *Note:* Generation costs per image (approx. $0.02-$0.19 depending on quality) necessitate usage limits.
    -   **Deployment (Initial considerations):** Static hosting for frontend (e.g., Vercel, Netlify), Serverless function or container hosting for backend (e.g., AWS Lambda, Google Cloud Run, Fly.io).
        -   *Future Consideration:* Firebase (Hosting, Functions, Firestore/Realtime DB) could be evaluated for integrated backend services.
    -   **Package Management:** npm/yarn (Frontend), pip/poetry (Backend)

-   **Authentication Process**
    -   None for Phase 1. Access is anonymous. Usage limits will be tracked via client-side mechanisms or potentially IP-based rate limiting on the backend if necessary, but without user accounts.
    -   *Future Consideration:* Firebase Authentication could be used for full user accounts in later phases.

-   **Route Design**
    -   **Frontend:**
        -   `/`: Main application page housing the upload, style selection, generation, and display components.
    -   **Backend (API):**
        -   `/api/generate-image` (POST): Endpoint to handle image upload and trigger AI generation.

-   **API Design**
    -   **Endpoint:** `POST /api/generate-image`
        -   **Request:**
            -   `Content-Type`: `multipart/form-data`
            -   `image`: The uploaded pet image file.
            -   `style` (optional): String identifier for a predefined style.
            -   `prompt` (optional): String containing the custom user prompt. (Note: Either `style` or `prompt` should be provided).
        -   **Response (Success - 200 OK):**
            -   `Content-Type`: `application/json`
            -   Body: `{ "imageUrl": "url_to_generated_image.jpg" }` (or potentially base64 encoded image data if direct URL is not feasible/desirable)
        -   **Response (Error - 4xx/5xx):**
            -   `Content-Type`: `application/json`
            -   Body: `{ "error": "Error message describing the issue" }` (e.g., validation error, AI API error, rate limit exceeded).

-   **Database Design ERD**
    -   Not applicable for Phase 1. No database is required as user data and generated images are not persistently stored on the server side.
    -   *Future Consideration:* Firebase Firestore or Realtime Database could be used if transitioning backend services.