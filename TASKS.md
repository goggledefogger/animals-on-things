# Pets-On-Things Phase 1 Implementation

Implement the core functionality for users to manage **Animal Profiles** (for any animal!), upload photos for them, and generate stylized AI images using OpenAI, persisting data via an anonymous user ID stored in the browser.

## Completed Tasks

- [x] Define Product Requirements (`PRD.md`)
- [x] Define Software Requirements (`SOFTWARE.md`)
- [x] Define UI Description (`UI.md`)
- [x] Create initial `README.md`
- [x] Create initial `TASKS.md`

## In Progress Tasks

- [ ] **Setup Backend Project Structure (Python/FastAPI)**
    - [ ] Initialize FastAPI project
    - [ ] Setup basic configuration (e.g., environment variables)
    - [ ] Add basic health check endpoint
- [ ] **Setup Frontend Project Structure (React/TS/Vite/Tailwind)**
    - [ ] Initialize Vite project with React & TypeScript template
    - [ ] Install and configure Tailwind CSS
- [ ] **Database & Storage Setup**
    - [ ] Choose and setup database (e.g., PostgreSQL via Docker)
    - [ ] Define initial DB schema (AnonymousUser, **AnimalProfile**, **AnimalPhoto**) using an ORM (e.g., SQLAlchemy with Alembic for migrations)
    - [ ] Implement database connection logic in FastAPI
    - [ ] Setup cloud storage (e.g., S3 bucket) and credentials/SDK for image uploads

## Future Tasks (Phase 1)

- [ ] **Implement Anonymous User ID Handling**
    - [ ] Backend: API endpoint to generate/return a unique anonymous user ID.
    - [ ] Frontend: Logic to request ID if not present in local storage, store it, and send it with subsequent requests.
- [ ] **Implement Animal Profile Management Backend**
    - [ ] API Endpoint: Create Animal Profile (name/identifier, associated anonymousUserId)
    - [ ] API Endpoint: Get Animal Profiles (for a given anonymousUserId)
    - [ ] API Endpoint: Delete Animal Profile (by ID, ensuring ownership via anonymousUserId)
- [ ] **Implement Animal Photo Management Backend**
    - [ ] API Endpoint: Upload Animal Photo (image file, associated AnimalProfileID). Handle image upload to cloud storage, store metadata (URL, AnimalProfileID) in DB.
    - [ ] API Endpoint: Get Photos (for a given AnimalProfileID)
    - [ ] API Endpoint: Delete Animal Photo (by ID, ensuring ownership)
- [ ] **Implement Animal Profile Management Frontend**
    - [ ] UI Component: Display list of Animal Profiles
    - [ ] UI Component: Input/Button to create a new Animal Profile
    - [ ] UI Component: Functionality to delete an Animal Profile
- [ ] **Implement Animal Photo Management Frontend**
    - [ ] UI Component: Display photo gallery for a selected Animal Profile
    - [ ] UI Component: Uploader to add photos to the selected Animal Profile
    - [ ] UI Component: Functionality to select a photo for generation
    - [ ] UI Component: Functionality to delete a photo
- [ ] **Implement Image Generation Backend**
    - [ ] API Endpoint: Generate Image (`/api/generate-image`)
        -   Accept selected **AnimalPhoto** ID (or URL), style/prompt, anonymousUserId
        -   Retrieve image data from storage
        -   Call OpenAI `gpt-image-1` API
        -   Handle response/errors
        -   Implement basic rate limiting based on anonymousUserId
- [ ] **Implement Image Generation Frontend**
    - [ ] UI Component: Style selector (predefined options)
    - [ ] UI Component: Custom prompt input field
    - [ ] UI Component: "Generate" button (activates when requirements met)
    - [ ] UI Component: Display generated image result
    - [ ] UI Component: Download button for generated image
    - [ ] UI Component: Session gallery for recently generated images
- [ ] **Refinement & Styling**
    - [ ] Apply playful & simple theme based on `UI.md` using Tailwind
    - [ ] Add loading indicators and error handling feedback
    - [ ] Ensure responsiveness across devices
    - [ ] Ensure copy and visual tone align with the dual mission of fun creativity and **animal welfare/conservation** support.
- [ ] **Add Basic Environment Configuration (Dev/Prod)**
- [ ] **Write Basic Tests (Unit/Integration)**
- [ ] **Deployment Setup (Frontend & Backend)**

## Implementation Plan

1.  **Foundation:** Set up backend (FastAPI) and frontend (React/Vite/TS/Tailwind) project structures.
2.  **Persistence Layer:** Set up the database schema (AnonymousUser, **AnimalProfile**, **AnimalPhoto**) and cloud storage for images.
3.  **Core Backend Logic:** Implement API endpoints for anonymous user ID generation, **Animal Profile** management (CRUD), and **Animal Photo** management (CRUD, including upload to storage).
4.  **Core Frontend Logic:** Implement UI components for anonymous user ID handling (local storage), displaying/creating **Animal Profiles**, displaying/uploading photos for a selected **Animal Profile**.
5.  **Generation Integration:** Implement the backend logic to call the OpenAI API and the corresponding frontend UI elements (style/prompt selection, generation button, result display/download).
6.  **Refinement:** Apply styling, add loading/error states, ensure responsiveness.
7.  **Testing & Deployment:** Add tests and configure deployment pipelines/steps.

### Relevant Files

*(To be populated as development progresses)*
- `PRD.md` - Product Requirements Document
- `SOFTWARE.md` - Software Requirements Specification
- `UI.md` - User Interface Description Document
- `README.md` - Project Overview
- `TASKS.md` - Implementation Tasks (this file)
- `backend/` - FastAPI application code (structure TBD)
- `frontend/` - React application code (structure TBD)
- `database/migrations/` - Database migration scripts 

## Future Tasks (Phase 2 - Merchandise & Accounts)

- [ ] **Implement User Authentication**
    - [ ] Replace anonymous ID system with full user accounts (e.g., email/password, potentially social logins via Firebase Auth or similar).
    - [ ] Backend: Implement auth endpoints (signup, login, logout), session/token management.
    - [ ] Frontend: Implement login/signup UI and state management.
    - [ ] Database: Add `User` table, link **AnimalProfiles/AnimalPhotos** to authenticated users.
    - [ ] Consider migration path for existing anonymous user data.
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