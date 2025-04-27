import { useState, useCallback } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom'; // Import routing components and NavLink
import { useAuth } from './contexts/AuthContext';
import { useAnimalProfiles } from './hooks/useAnimalProfiles'; // Import the hook for animal profiles
// import { AnimalProfileList } from './components/features/AnimalProfileList'; // Old component
// import { SelectedPhotosPanel } from './components/features/SelectedPhotosPanel'; // Old component
// import { ImageGenerationPanel } from './components/features/ImageGenerationPanel'; // Old component
// import { Card } from './components/common/Card'; // Likely used within new components
import { type AnimalProfile } from './types/AnimalProfile'; // Import AnimalProfile type
import AnimalProfilesPanel from './components/features/AnimalProfilesPanel';
import { WorkspacePanel } from './components/features/WorkspacePanel';
import { ImageHistoryGallery } from './components/features/ImageHistoryGallery'; // Import the correct history component
import { usePhotoDeletion } from './hooks/usePhotoDeletion'; // Import the deletion hook

// Define map type for selected photos
export interface SelectedPhotoMap {
  [profileId: string]: string | null; // Maps profile ID to selected Photo ID (or null)
}

// Define and export the type for the workspace context (can be expanded later)
export type WorkspaceContext =
  | null
  | { type: 'generation_setup', selectedProfiles: AnimalProfile[], selectedPhotoMap: SelectedPhotoMap }
  | { type: 'viewing_details', profile: AnimalProfile }; // Add viewing_details case

// Define input type for the delete handler (matches hook input)
interface DeletePhotoInput {
  profileId: string;
  photoId: string;
  storagePath: string;
}

function App() {
  const { currentUser, loading } = useAuth();
  const [workspaceContext, setWorkspaceContext] = useState<WorkspaceContext>(null);
  // Centralized state for selected profiles for generation
  const [selectedProfiles, setSelectedProfiles] = useState<AnimalProfile[]>([]);
  // State to map selected profile IDs to their chosen photo ID for generation
  const [selectedPhotoMap, setSelectedPhotoMap] = useState<SelectedPhotoMap>({});
  // Access animal profiles functionality
  const { profiles, loading: profilesLoading, error: profilesError, deleteProfile } = useAnimalProfiles();

  // Initialize the deletion hook
  const { deletePhoto, deletionError } = usePhotoDeletion();

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

  // Implement the photo deletion handler
  const handleDeletePhoto = useCallback(async (input: DeletePhotoInput): Promise<boolean> => {
    console.log('Requesting photo delete:', input);
    const success = await deletePhoto(input);
    if (success) {
        console.log('Photo deleted successfully.');
        // If the deleted photo was selected for generation, clear that selection
        if (selectedPhotoMap[input.profileId] === input.photoId) {
            // Trigger a state update to clear the selection map for this profile
            handlePhotoSelectForGeneration(input.profileId, null);
        }
        // Note: The MiniPhotoGallery will refetch via useAnimalPhotos hook
        // *if* that hook is enhanced to listen for RTDB changes or manually refetched.
        // For now, the photo might visually linger until a page refresh or profile re-selection.
        // TODO: Enhance useAnimalPhotos to update automatically after deletion.
    } else {
        console.error('Photo deletion failed:', deletionError);
        // Show error to user? (Deletion hook manages error state, maybe display it globally?)
        alert(`Failed to delete photo: ${deletionError}`); // Simple alert for now
    }
    return success;
  }, [deletePhoto, selectedPhotoMap, handlePhotoSelectForGeneration, deletionError]); // Add dependencies

  // Profile detail view handler
  const handleViewProfileDetails = useCallback((profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setWorkspaceContext({
        type: 'viewing_details',
        profile: profile,
      });
    }
  }, [profiles]);

  // Handler for profile deletion
  const handleDeleteProfile = useCallback((profileId: string) => {
    // Remove from selected profiles if needed
    const isSelected = selectedProfiles.some(p => p.id === profileId);
    if (isSelected) {
      setSelectedProfiles(prev => prev.filter(p => p.id !== profileId));

      // Also remove from photo map
      setSelectedPhotoMap(prev => {
        const newMap = { ...prev };
        delete newMap[profileId];
        return newMap;
      });
    }

    // Call the delete function from the hook
    deleteProfile(profileId);
  }, [selectedProfiles, deleteProfile]);

  // Helper function for NavLink className
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
    const activeClasses = "bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-100";
    const inactiveClasses = "text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white";
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    // Using the theme colors defined in the visual language
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 sm:px-6 py-8 sm:py-10">
      {/* Central container with max width */}
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 sm:mb-10 flex flex-col sm:flex-row justify-between items-center">
          <Link to="/" className="block text-center text-3xl sm:text-4xl font-bold font-nunito my-4 sm:my-6 text-gray-800 dark:text-gray-100 no-underline hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
            Animals On Things
          </Link>
          {/* Updated Navigation using NavLink */}
          {currentUser && (
            <nav className="mt-4 sm:mt-0 flex space-x-2">
              <NavLink to="/" className={getNavLinkClass} end> {/* Use 'end' prop for exact match on root */}
                Generator
              </NavLink>
              <NavLink to="/gallery" className={getNavLinkClass}> {/* Updated path */}
                Gallery {/* Updated text */}
              </NavLink>
            </nav>
          )}
        </header>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-10">
            <p>Loading...</p>
          </div>
        )}

        {/* Main content area when logged in */}
        {!loading && currentUser && (
          <Routes> { /* Define Routes */}
            <Route path="/" element={
              // Main Generator View Layout
              <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
                <div className="w-full xl:w-1/3 flex-shrink-0">
                  <AnimalProfilesPanel
                    profiles={profiles}
                    selectedProfiles={selectedProfiles}
                    onSelectProfileToggle={handleProfileSelectToggle}
                    onDelete={handleDeleteProfile}
                    handleViewDetails={handleViewProfileDetails}
                    loading={profilesLoading}
                    error={profilesError || undefined}
                  />
                </div>
                <div className="w-full xl:w-2/3">
                  <WorkspacePanel
                    context={workspaceContext}
                    onPhotoSelectForGeneration={handlePhotoSelectForGeneration}
                    onDeletePhoto={handleDeletePhoto}
                  />
                </div>
              </div>
            } />
            <Route path="/gallery" element={<ImageHistoryGallery />} /> { /* Use ImageHistoryGallery */}
          </Routes>
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
