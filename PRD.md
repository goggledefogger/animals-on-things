# Product Requirements Document: Pets-On-Things (Phase 1: Image Generation with Persistent Anonymous Animals)

## 1. Elevator Pitch

Pets-On-Things allows **animal lovers** to create profiles for **any animal** (pets, wildlife, insects, etc.), upload multiple photos for each, and use AI to generate unique, stylized images based on a selected photo (e.g., animals as comic book heroes, in cozy scenes, or custom scenarios). Data is associated with the user's browser via a persistent anonymous ID. It's a fun way to celebrate **all creatures** while aiming to eventually **support animal welfare and conservation organizations** through future merchandise sales.

## 2. Who is this app for?

*   **Anyone** looking for fun, creative ways to picture **any animal** they care about (pets, local wildlife, interesting insects, etc.).
*   Families and kids who love animals.
*   Animal lovers seeking unique animal-related content.
*   **People interested in supporting animal rescue, welfare, and conservation causes.**
*   Potentially, relevant organizations themselves as a tool for engagement or fundraising (in later phases).

## 3. Functional Requirements (Phase 1)

*   **Persistent Anonymous User Identification:**
    -   Generate a unique anonymous user ID upon first visit.
    -   Store this ID persistently in the user's browser (e.g., local storage).
    -   Associate all created Animal Profiles and Photos with this ID.
*   **Animal Profile Management:**
    -   Allow users to create a new "Animal" profile (e.g., giving it a name or identifier).
    -   Display a list or gallery of the user's created Animal Profiles.
    -   Allow users to delete an Animal profile (and its associated photos).
*   **Animal Photo Management:**
    -   Allow users to upload *one or more* photos specifically *for a selected Animal Profile*.
    -   Display thumbnails of all photos associated with a selected Animal Profile.
    -   Allow users to delete individual photos associated with an Animal Profile.
    -   Allow users to select a specific photo from an Animal's gallery to use as input for AI generation.
*   **Style Selection:**
    *   Provide a curated list of predefined style presets (e.g., "Comic Book," "Jungle Adventure," "Cozy Nap," "Space Explorer").
    *   Allow users to input a custom text prompt describing the desired style, scene, or theme.
*   **AI Image Generation:**
    -   Integrate with the OpenAI `gpt-image-1` API.
    -   Generate a new image based on the *selected Animal Photo* and the chosen style/prompt, aiming to retain the animal's likeness.
    -   Handle API interactions, including sending the photo and prompt, and receiving the generated image.
*   **Image Display & Download:**
    *   Display the generated image clearly to the user.
    *   Allow users to download the generated image file directly to their device.
*   **Generated Image Gallery:** Implement a gallery view to display AI images *generated during the current user session*.
*   **Usage Limits:** Implement a limit (e.g., 3 generations per day) tracked against the persistent anonymous user ID to manage API costs.
*   **Brand Reflection:** The overall tone, copy, and presentation should consistently reflect the dual goals of fun **animal creativity** and supporting **animal welfare/conservation**.

## 4. User Stories (Phase 1)

*   As a user, I want to create a profile for the **neighborhood squirrel "Sparky"** so I can keep photos of him organized.
*   As a user, I want to upload several photos of Sparky to his profile so I have options to choose from later.
*   As a user, I want to see all the **Animal profiles** I've created when I revisit the site (using the same browser).
*   As a user, I want to view all the photos I've uploaded for Sparky.
*   As a user, I want to select my favorite photo of Sparky from his gallery to use for generating an AI image.
*   As a user, I want to pick from a list of predefined styles (like "fantasy art" or "watercolor") so I can quickly get cool results for my selected **animal photo**.
*   As a user, I want to be able to type in a specific scene, like "Sparky riding a tiny motorcycle," to create a unique image based on his photo.
*   As a user, I want to see the final generated image clearly on the screen.
*   As a user, I want to save the generated image to my computer or phone.
*   As a user, I want to see the AI images I've just created in this session.
*   As a user, I want to be able to delete an **Animal profile** I no longer need.
*   As a user, I want to be able to delete a specific photo from an **Animal's profile**.

## 5. User Interface (Phase 1 - Initial Concept)

*(Refer to `UI.md` for the detailed description based on Option A - Persistent Anonymous Users. Core concepts include **Animal Profile** management, multi-photo upload per animal, photo selection, style/prompt input, and result display/gallery.)*