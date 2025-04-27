import { useState, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
// import { AnimalProfileList } from './components/features/AnimalProfileList'; // Old component
// import { SelectedPhotosPanel } from './components/features/SelectedPhotosPanel'; // Old component
// import { ImageGenerationPanel } from './components/features/ImageGenerationPanel'; // Old component
// import { Card } from './components/common/Card'; // Likely used within new components
import { type AnimalProfile } from './types/AnimalProfile'; // Import AnimalProfile type

// Import the new layout components
import { AnimalProfilesPanel } from './components/features/AnimalProfilesPanel';
import { WorkspacePanel } from './components/features/WorkspacePanel';

// Define map type for selected photos
export interface SelectedPhotoMap {
  [profileId: string]: string | null; // Maps profile ID to selected Photo ID (or null)
}

// Define and export the type for the workspace context (can be expanded later)
export type WorkspaceContext =
  | null
  | { type: 'viewing_details', profileId: string }
  | { type: 'generation_setup', selectedProfiles: AnimalProfile[], selectedPhotoMap: SelectedPhotoMap }; // Include selected profiles and selectedPhotoMap

function App() {
  const { currentUser, loading } = useAuth();
  const [workspaceContext, setWorkspaceContext] = useState<WorkspaceContext>(null);
  // Centralized state for selected profiles for generation
  const [selectedProfiles, setSelectedProfiles] = useState<AnimalProfile[]>([]);
  // State to map selected profile IDs to their chosen photo ID for generation
  const [selectedPhotoMap, setSelectedPhotoMap] = useState<SelectedPhotoMap>({});

  // Handler for when user clicks "View Details" on a profile card
  const handleViewProfileDetails = useCallback((profileId: string) => {
    setWorkspaceContext({ type: 'viewing_details', profileId });
    // Deselect profiles when viewing details
    setSelectedProfiles([]);
    setSelectedPhotoMap({}); // Clear photo selections too
  }, []);

  // Handler for toggling profile selection - lives in App now
  const handleProfileSelectToggle = useCallback((profile: AnimalProfile) => {
    let newSelectedProfiles: AnimalProfile[];
    const newPhotoMap: SelectedPhotoMap = { ...selectedPhotoMap }; // Start with current map

    setSelectedProfiles(prevSelected => {
      const isSelected = prevSelected.some(p => p.id === profile.id);
      if (isSelected) {
        newSelectedProfiles = prevSelected.filter(p => p.id !== profile.id);
        // Remove from photo map if deselecting
        delete newPhotoMap[profile.id];
      } else {
        newSelectedProfiles = [...prevSelected, profile];
        // Add to photo map with null selection initially
        newPhotoMap[profile.id] = newPhotoMap[profile.id] || null;
      }
      // Update the photo map state
      setSelectedPhotoMap(newPhotoMap);
      // Update context immediately based on the new selection
      if (newSelectedProfiles.length > 0) {
          setWorkspaceContext({ type: 'generation_setup', selectedProfiles: newSelectedProfiles, selectedPhotoMap: newPhotoMap });
      } else {
          setWorkspaceContext(null); // Revert to default if none selected
      }
      return newSelectedProfiles;
    });
  }, [selectedPhotoMap]); // Depend on photo map

  // Handler for selecting a specific photo for a profile *during generation setup*
  const handlePhotoSelectForGeneration = useCallback((profileId: string, photoId: string | null) => {
    if (selectedProfiles.some(p => p.id === profileId)) {
      const newPhotoMap = { ...selectedPhotoMap, [profileId]: photoId };
      setSelectedPhotoMap(newPhotoMap);
      // Update context ONLY if already in generation setup
      setWorkspaceContext(prevContext => {
        if (prevContext?.type === 'generation_setup') {
          return { ...prevContext, selectedPhotoMap: newPhotoMap };
        }
        return prevContext;
      });
    } else {
      console.warn("Attempted to select photo for a profile not selected for generation");
    }
  }, [selectedProfiles, selectedPhotoMap]); // Depend on selectedProfiles and map

  return (
    // Using the theme colors defined in the visual language
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 sm:px-6 py-8 sm:py-10">
      {/* Central container with max width */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold font-nunito text-sky-700 dark:text-sky-300 mb-8 sm:mb-10">
          Animals On Things
        </h1>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-10">
            <p>Loading...</p>
          </div>
        )}

        {/* Main content area when logged in */}
        {!loading && currentUser && (
          // Flex container for the two columns
          // Stacks vertically on screens smaller than 'xl' (Tailwind breakpoint)
          <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">

            {/* Left Column: Animal Profiles Panel */}
            {/* Takes 1/3 width on xl screens, full width below */}
            <div className="w-full xl:w-1/3 flex-shrink-0">
              <AnimalProfilesPanel
                selectedProfiles={selectedProfiles}
                onSelectProfileToggle={handleProfileSelectToggle}
                onViewProfileDetails={handleViewProfileDetails}
              />
            </div>

            {/* Right Column: Workspace Panel */}
            {/* Takes 2/3 width on xl screens, full width below */}
            <div className="w-full xl:w-2/3">
              <WorkspacePanel
                context={workspaceContext}
                onPhotoSelectForGeneration={handlePhotoSelectForGeneration}
              />
            </div>
          </div>
        )}

        {/* Message when not logged in */}
        {!loading && !currentUser && (
          <div className="text-center py-10 text-red-600 dark:text-red-400">
            <p>Please wait, initializing anonymous session...</p>
            {/* Or show a login button if not using anonymous auth */}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
