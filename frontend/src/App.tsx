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

// Simplify WorkspaceContext type
export type WorkspaceContext =
  | null
  | { type: 'generation_setup', selectedProfiles: AnimalProfile[], selectedPhotoMap: SelectedPhotoMap };

// Define input type for the delete handler (matches hook input)
interface DeletePhotoInput {
  profileId: string;
  photoId: string;
  storagePath: string;
}

function App() {
  const { currentUser, loading } = useAuth();
  const [workspaceContext, setWorkspaceContext] = useState<WorkspaceContext>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<AnimalProfile[]>([]);
  const [selectedPhotoMap, setSelectedPhotoMap] = useState<SelectedPhotoMap>({});
  const { profiles, loading: profilesLoading, error: profilesError, deleteProfile } = useAnimalProfiles();
  const { deletePhoto, deletionError } = usePhotoDeletion();

  // Refactor toggle handler for clarity and direct context setting
  const handleProfileSelectToggle = useCallback((profile: AnimalProfile) => {
    let nextSelectedProfiles: AnimalProfile[];
    let nextPhotoMap: SelectedPhotoMap;

    // Determine next state based on current state
    const isCurrentlySelected = selectedProfiles.some(p => p.id === profile.id);
    if (isCurrentlySelected) {
      nextSelectedProfiles = selectedProfiles.filter(p => p.id !== profile.id);
      nextPhotoMap = { ...selectedPhotoMap };
      delete nextPhotoMap[profile.id];
    } else {
      nextSelectedProfiles = [...selectedProfiles, profile];
      // Ensure entry exists in map, default to null if needed
      nextPhotoMap = { ...selectedPhotoMap, [profile.id]: selectedPhotoMap[profile.id] || null }; 
    }

    // Update the primary states
    setSelectedProfiles(nextSelectedProfiles);
    setSelectedPhotoMap(nextPhotoMap);

    // Directly set the context based on the *result* of the selection update
    if (nextSelectedProfiles.length > 0) {
      setWorkspaceContext({ 
        type: 'generation_setup', 
        selectedProfiles: nextSelectedProfiles, 
        selectedPhotoMap: nextPhotoMap 
      });
    } else {
      setWorkspaceContext(null); // Clear context if no profiles are selected
    }
  }, [selectedProfiles, selectedPhotoMap]); // Dependencies include states used for calculation

  // Handler for selecting a specific photo for a profile *during generation setup*
  const handlePhotoSelectForGeneration = useCallback((profileId: string, photoId: string | null) => {
    // Only update map if profile is actually selected
    if (selectedProfiles.some(p => p.id === profileId)) {
      const newPhotoMap = { ...selectedPhotoMap, [profileId]: photoId };
      setSelectedPhotoMap(newPhotoMap);
      // Also update the context *if* it's currently generation_setup
      setWorkspaceContext(prevContext => {
        if (prevContext?.type === 'generation_setup') {
          // Make sure selectedProfiles is also up-to-date in the context 
          // (though it should be, this ensures consistency)
          return { 
              type: 'generation_setup', 
              selectedProfiles: selectedProfiles, // Use current selectedProfiles state
              selectedPhotoMap: newPhotoMap 
          };
        }
        return prevContext; // Don't change context if not in generation setup
      });
    }
  }, [selectedProfiles, selectedPhotoMap]); // Added selectedProfiles dependency

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

  // Handler for profile deletion
  const handleDeleteProfile = useCallback((profileId: string) => {
    // Update selected profiles and map first
    const nextSelectedProfiles = selectedProfiles.filter(p => p.id !== profileId);
    const nextPhotoMap = { ...selectedPhotoMap };
    delete nextPhotoMap[profileId];
    
    setSelectedProfiles(nextSelectedProfiles);
    setSelectedPhotoMap(nextPhotoMap);

    // Update context based on the new state
    if (nextSelectedProfiles.length > 0) {
      setWorkspaceContext({ 
          type: 'generation_setup', 
          selectedProfiles: nextSelectedProfiles, 
          selectedPhotoMap: nextPhotoMap 
      });
    } else {
      setWorkspaceContext(null);
    }

    // Call the actual delete function from the hook
    deleteProfile(profileId);
  }, [selectedProfiles, selectedPhotoMap, deleteProfile]); // Added selectedPhotoMap dependency

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
          <Link to="/" className="block text-center text-4xl sm:text-5xl font-bold font-nunito my-4 sm:my-6 text-sky-700 dark:text-sky-300 no-underline hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
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
