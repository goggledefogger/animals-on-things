import React from 'react';
import { Routes, Route, Navigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import FinishLoginPage from './components/auth/FinishLoginPage';
import ProtectedRoutes from './components/auth/ProtectedRoutes';
import { Button } from './components/common/Button'; // Import Button for Sign Out

// Import existing main components and types
import { useAnimalProfiles } from './hooks/useAnimalProfiles';
import { usePhotoDeletion } from './hooks/usePhotoDeletion';
import AnimalProfilesPanel from './components/features/AnimalProfilesPanel';
import { WorkspacePanel } from './components/features/WorkspacePanel';
import { ImageHistoryGallery } from './components/features/ImageHistoryGallery';
import { type AnimalProfile } from './types/AnimalProfile';
// Removed import { type SelectedPhotoMap, type WorkspaceContext, type DeletePhotoInput } from './AppTypes';
import logo from './assets/logo-teal.png';
import { useState, useCallback } from 'react'; // Keep useState/useCallback if needed within ProtectedRoutes area

// Define types locally within App.tsx
export interface SelectedPhotoMap {
  [profileId: string]: string | null;
}
export type WorkspaceContext =
  | null
  | { type: 'generation_setup', selectedProfiles: AnimalProfile[], selectedPhotoMap: SelectedPhotoMap };
export interface DeletePhotoInput {
  profileId: string;
  photoId: string;
  storagePath: string;
}

// Helper function for NavLink className - can stay here or move
const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
  const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
  const activeClasses = "bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-100";
  const inactiveClasses = "text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white";
  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
};

// Layout component for common header and footer
const AppLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { signOutUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header with Sign Out Button */}
        <header className="mb-8 sm:mb-10 flex flex-col sm:flex-row justify-between items-center">
          <Link to="/" className="flex items-center text-center text-4xl sm:text-5xl font-bold font-nunito my-4 sm:my-6 text-sky-700 dark:text-sky-300 no-underline hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
            <img src={logo} alt="Animals On Things logo" className="w-10 sm:w-12 mr-3 self-stretch" />
            Animals On Things
          </Link>
          {/* Navigation and Sign Out Button */}
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <nav className="flex space-x-2">
              <NavLink to="/" className={getNavLinkClass} end>
                Generator
              </NavLink>
              <NavLink to="/gallery" className={getNavLinkClass}>
                Gallery
              </NavLink>
            </nav>
            <Button
              variant="secondary"
              size="sm"
              onClick={signOutUser}
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main content area */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

// --- Main App Structure with Routing ---
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/finishLogin" element={<FinishLoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<MainGeneratorView />} />
        <Route path="/gallery" element={
          <AppLayout>
            <ImageHistoryGallery />
          </AppLayout>
        } />
      </Route>

      {/* Redirect any unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// --- Component for the main protected view (Generator) ---
// This contains the state and logic previously in App()
function MainGeneratorView() {

  // const { currentUser, signOutUser } = useAuth(); // Destructure currentUser, acknowledge it's unused for now - REMOVED
  // Keep the state logic for profile/photo selection here
  const [workspaceContext, setWorkspaceContext] = useState<WorkspaceContext>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<AnimalProfile[]>([]);
  const [selectedPhotoMap, setSelectedPhotoMap] = useState<SelectedPhotoMap>({});
  const { profiles, loading: profilesLoading, error: profilesError, deleteProfile } = useAnimalProfiles();
  const { deletePhoto, isDeleting: isDeletingPhoto, deletionError: photoDeletionError } = usePhotoDeletion();

  // --- Keep Callbacks (handleProfileSelectToggle, handlePhotoSelectForGeneration, handleDeletePhoto, handleDeleteProfile) here ---
  // (Ensure they use the state defined within this component)

  const handleProfileSelectToggle = useCallback((profile: AnimalProfile) => {
    let nextSelectedProfiles: AnimalProfile[];
    let nextPhotoMap: SelectedPhotoMap;

    const isCurrentlySelected = selectedProfiles.some(p => p.id === profile.id);
    if (isCurrentlySelected) {
      nextSelectedProfiles = selectedProfiles.filter(p => p.id !== profile.id);
      nextPhotoMap = { ...selectedPhotoMap };
      delete nextPhotoMap[profile.id];
    } else {
      nextSelectedProfiles = [...selectedProfiles, profile];
      nextPhotoMap = { ...selectedPhotoMap, [profile.id]: selectedPhotoMap[profile.id] || null };
    }

    setSelectedProfiles(nextSelectedProfiles);
    setSelectedPhotoMap(nextPhotoMap);

    if (nextSelectedProfiles.length > 0) {
      setWorkspaceContext({
        type: 'generation_setup',
        selectedProfiles: nextSelectedProfiles,
        selectedPhotoMap: nextPhotoMap
      });
    } else {
      setWorkspaceContext(null);
    }
  }, [selectedProfiles, selectedPhotoMap]);

  const handlePhotoSelectForGeneration = useCallback((profileId: string, photoId: string | null) => {
    if (selectedProfiles.some(p => p.id === profileId)) {
      const newPhotoMap = { ...selectedPhotoMap, [profileId]: photoId };
      setSelectedPhotoMap(newPhotoMap);
      // Explicitly type prevContext
      setWorkspaceContext((prevContext: WorkspaceContext | null) => {
        if (prevContext?.type === 'generation_setup') {
          return {
              type: 'generation_setup',
              selectedProfiles: selectedProfiles,
              selectedPhotoMap: newPhotoMap
          };
        }
        return prevContext;
      });
    }
  }, [selectedProfiles, selectedPhotoMap]);

  const handleDeletePhoto = useCallback(async (input: DeletePhotoInput): Promise<boolean> => {
    console.log('Requesting photo delete:', input);
    const success = await deletePhoto(input);
    if (success) {
        console.log('Photo deleted successfully.');
        if (selectedPhotoMap[input.profileId] === input.photoId) {
            handlePhotoSelectForGeneration(input.profileId, null);
        }
    } else {
        console.error('Photo deletion failed:', photoDeletionError);
        alert(`Failed to delete photo: ${photoDeletionError}`);
    }
    return success;
  }, [deletePhoto, selectedPhotoMap, handlePhotoSelectForGeneration, photoDeletionError]);

  const handleDeleteProfile = useCallback((profileId: string) => {
    const nextSelectedProfiles = selectedProfiles.filter(p => p.id !== profileId);
    const nextPhotoMap = { ...selectedPhotoMap };
    delete nextPhotoMap[profileId];

    setSelectedProfiles(nextSelectedProfiles);
    setSelectedPhotoMap(nextPhotoMap);

    if (nextSelectedProfiles.length > 0) {
      setWorkspaceContext({
          type: 'generation_setup',
          selectedProfiles: nextSelectedProfiles,
          selectedPhotoMap: nextPhotoMap
      });
    } else {
      setWorkspaceContext(null);
    }
    deleteProfile(profileId);
  }, [selectedProfiles, selectedPhotoMap, deleteProfile]);

  // --- Return the main layout JSX ---
  return (
    <AppLayout>
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
            isDeletingPhoto={isDeletingPhoto}
            photoDeletionError={photoDeletionError}
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default App;
