# User Interface Description Document: Animals-On-Things

This document outlines the user interface design for the Animals-On-Things application, focusing initially on Phase 1 (playful/simple, persistent anonymous ID) and outlining future additions.

## Phase 1 UI Elements

-   **Layout Structure**
    -   Primarily a single-column layout on desktop, ensuring a straightforward vertical flow.
    -   Layout stacks cleanly and remains intuitive on mobile devices.
    -   Clear visual separation between functional sections: **Animal Profile** Management/Selection, Photo Upload/Selection, Style/Prompt Input, and Result Display/Gallery.
    -   A dedicated area will display the user's created "Animal Profiles" (e.g., cards or list items).

-   **Core Components**
    -   **Animal Profile List/Gallery:** Displays cards or list items for each "Animal Profile" created by the user (associated via anonymous ID). Each item shows the Animal's name/identifier and possibly a primary photo thumbnail.
    -   **Create Animal Profile Input/Button:** A simple input field and button (e.g., "+ Add New Animal") to allow users to name/identify and create a new Animal profile.
    -   **Animal Profile Detail View (Implicit or Explicit):** Selecting an Animal Profile from the list reveals its associated photos. This could be inline expansion or navigating to a dedicated view/modal.
    -   **Multi-Photo Uploader (Contextual):** An upload area (drag-and-drop/button) specifically for adding photos *to the currently selected Animal Profile*. Shows upload progress for multiple files.
    -   **Animal Photo Gallery:** Displays thumbnails of all photos uploaded for the *selected Animal Profile*. Allows the user to select one photo to be used for generation.
    -   **Style Selector:** Visually engaging selection for predefined styles (buttons, tiles).
    -   **Custom Prompt Input:** Simple text input for custom descriptions.
    -   **Generate Button:** Clear button to start AI generation, enabled only when an Animal photo and a style/prompt are selected.
    -   **Result Display:** Large area for the final generated image.
    -   **Download Button:** Obvious icon/button to save the result.
    -   **Session Gallery (Generated Images):** Horizontally scrollable row of thumbnails showing images generated during the current session.

-   **Interaction patterns**
    -   **Initial View:** Shows existing **Animal Profiles** (if any) and the "+ Add New Animal" option.
    -   **Creating an Animal Profile:** User types name/identifier, clicks add. The new Animal Profile appears in the list.
    -   **Adding Photos:** User selects an Animal Profile, then uses the uploader to add images *to that specific Animal Profile*.
    -   **Selecting for Generation:** User selects an Animal Profile, then clicks on one of its photos. This photo becomes the "active" input for generation.
    -   **Generation Flow:** Select/Enter Style/Prompt -> Click Generate -> View/Download Result.
    -   Clear visual feedback for loading states (fetching profiles, uploading photos, generating AI image).
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