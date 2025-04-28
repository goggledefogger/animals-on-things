# User Interface Description Document: Animals-On-Things

This document outlines the user interface design for the Animals-On-Things application, focusing initially on Phase 1 (playful/simple, persistent anonymous ID) and outlining future additions.

## Phase 1 UI Elements

-   **Layout Structure**
    -   Two-column layout on larger screens (e.g., desktop/tablet): Left column for **Animal Profile** list, Right column for photo selection and generation controls.
    -   Layout stacks cleanly into a single column on mobile devices.
    -   Clear visual separation between functional sections: Profile Management/Selection (Left), Photo Selection (Top-Right), Style/Prompt/Generation (Bottom-Right).
    -   Dedicated area (Left Column) displays the user's created "Animal Profiles" (e.g., cards or list items).

-   **Core Components**
    -   **Animal Profile List:** (Left Column) Displays cards/list items for each profile. Supports *multi-selection* (e.g., via clicking, highlighted background).
    -   **Create Animal Profile Input/Button:** (Within Profile List Card) Simple input and button to add new profiles.
    -   **Selected Photos Panel:** (Top-Right Column, appears when profiles are selected) Displays each multi-selected profile name. Below each name, shows thumbnails of available photos for that profile, allowing the user to select *one* photo per profile.
    -   **Photo Uploader:** Remains contextual, likely integrated near where photos are viewed/selected (e.g., within the profile list or the `SelectedPhotosPanel`).
    -   **Image Generation Panel:** (Bottom-Right Column) Contains:
        -   **Style Selector:** Visually engaging selection for predefined styles.
        -   **Custom Prompt Input:** Simple text input for custom descriptions.
        -   **Generate Button:** Clear button, enabled only when at least one profile/photo pair is fully selected.
        -   **Result Display:** Area for the final generated image.
        -   **Download Button:** Obvious icon/button to save the result.
        -   **Session Gallery (Generated Images):** Thumbnails showing recent generations.
    -   **Photo Thumbnail Component:** (Used within `SelectedPhotosPanel`) Displays a single image fetched from a storage path, handles loading/error state for the image.

-   **Interaction patterns**
    -   **Initial View:** Shows existing Animal Profiles (if any) and the "+ Add New Animal" option in the left column.
    -   **Creating an Animal Profile:** User types name, clicks add. New profile appears in the list.
    -   **Adding Photos:** User interacts with a profile (perhaps within the `AnimalProfileList` or `SelectedPhotosPanel`) to trigger the `PhotoUploader` for *that specific profile*.
    -   **Selecting for Generation:**
        1.  User clicks one or more profiles in the `AnimalProfileList` (left column) to select them.
        2.  The `SelectedPhotosPanel` appears/updates in the top-right column, showing the selected profiles.
        3.  User clicks on a photo thumbnail *within* the `SelectedPhotosPanel` for each profile they want to include in the generation.
        4.  The selection is visually indicated (e.g., border around thumbnail).
    -   **Generation Flow:** Select style/prompt in `ImageGenerationPanel` -> Click Generate (enabled once valid selections exist) -> View/Download Result.
    -   Clear visual feedback for loading states (fetching profiles, fetching photo thumbnails, uploading photos, generating AI image).
    -   Provides ability to delete Animal Profiles or individual photos.

-   **Visual Design Elements & Color Scheme**
    -   Utilizes a bright, cheerful, and inviting color palette, suitable for a wide range of animals.
    -   Employs rounded corners on buttons, input fields, and containers for a softer feel.
    -   Subtle, non-distracting background patterns or icons related to **animals in general** (e.g., simple nature elements, diverse footprints, silhouettes) could be used sparingly, avoiding bias towards traditional pets.
    -   Focus on clear visual hierarchy to guide the user's eye.
    -   Consider subtle ways to incorporate the brand's mission of supporting animal welfare (e.g., optional links, gentle visual cues, appropriate copy) without being intrusive in Phase 1.

-   **Mobile, Web App, Desktop considerations**
    -   Web-first design, fully responsive to work seamlessly across desktop and mobile browser sizes.
    -   Touch targets will be appropriately sized for mobile interaction.
    -   Layout adjusts fluidly to different screen widths.

-   **Typography**
    -   Uses fun, friendly, yet highly legible fonts. Headings might use a slightly more decorative (but still readable) font, while body text and UI labels use a clean sans-serif.
    -   Ensure sufficient font sizes and contrast for readability.

-   **Accessibility**
    -   Adhere to basic accessibility principles (sufficient color contrast, semantic HTML, keyboard navigability, descriptive labels for inputs/buttons).
    -   Alt text considerations for uploaded and generated images.
    -   Ensure **Animal Profile** and Photo management actions are accessible.

## Future Phase UI Elements (Examples)

-   **(Phase 2) Authentication:** Login/Signup forms/modals.
-   **(Phase 2) Merchandise:** Product browsing (categories, individual items), preview of generated image on products, product configuration (size, color), shopping cart icon/view.
-   **(Phase 3) Daily Image Feature:**
    -   **Settings Toggle:** A simple toggle switch (e.g., in a user settings area) to enable/disable the daily automated image generation.
    -   **Configuration (Optional):** Potentially options to select which animals are preferred for daily images.
    -   **Display Area:** A dedicated section on the dashboard or main page to prominently display the latest daily generated image, perhaps with the date/theme.
    -   **History View:** A gallery or list view to browse past daily generated images.
-   **(Phase 3) Charity Support:** UI elements indicating donation amounts/partners during checkout or on relevant pages.
-   **(Phase 3) Community:** User profiles, public galleries, like/comment buttons/feeds.
