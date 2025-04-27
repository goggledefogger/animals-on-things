import { useState, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AnimalProfileList } from './components/features/AnimalProfileList';
// Import the new component for selecting photos for multiple profiles
import { SelectedPhotosPanel } from './components/features/SelectedPhotosPanel'; 
import { ImageGenerationPanel } from './components/features/ImageGenerationPanel';
import { Card } from './components/common/Card';
import { AnimalProfile } from './types/AnimalProfile';

// Define a type for the mapping of selected photos
export interface SelectedPhotoMap {
  [profileId: string]: string | null; // Map profile ID to selected photo ID
}

function App() {
  const { currentUser, loading } = useAuth();
  // State for multiple selected profiles
  const [selectedProfiles, setSelectedProfiles] = useState<AnimalProfile[]>([]);
  // State for mapping selected profile IDs to their chosen photo ID
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhotoMap>({});

  // Handler for selecting/deselecting profiles (multi-select)
  const handleProfileSelectToggle = useCallback((profile: AnimalProfile) => {
    setSelectedProfiles(prevSelected => {
      const isSelected = prevSelected.some(p => p.id === profile.id);
      let newSelectedProfiles;
      if (isSelected) {
        newSelectedProfiles = prevSelected.filter(p => p.id !== profile.id);
      } else {
        newSelectedProfiles = [...prevSelected, profile];
      }
      
      // Also update the selected photos map when profiles change
      setSelectedPhotos(prevPhotos => {
        const newPhotos: SelectedPhotoMap = {};
        newSelectedProfiles.forEach(p => {
          // Keep existing selection if profile is still selected, otherwise null
          newPhotos[p.id] = prevPhotos[p.id] || null;
        });
        return newPhotos;
      });

      return newSelectedProfiles;
    });
  }, []);

  // Handler for selecting a photo for a specific profile
  const handlePhotoSelect = useCallback((profileId: string, photoId: string | null) => {
    // Only update if the profile is actually selected
    if (selectedProfiles.some(p => p.id === profileId)) {
      setSelectedPhotos(prev => ({
        ...prev,
        [profileId]: photoId,
      }));
      console.log(`Photo selection updated for profile ${profileId}:`, photoId);
    }
  }, [selectedProfiles]);

  // Determine which profile/photo pairs are ready for generation
  const generationSelections = selectedProfiles
    .map(profile => ({
      profileId: profile.id,
      photoId: selectedPhotos[profile.id] || null,
    }))
    .filter(selection => selection.photoId !== null) as { profileId: string; photoId: string }[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-7xl mx-auto">
        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-700 dark:text-indigo-300 mb-8 sm:mb-10">
          Animals On Things
        </h1>

        {/* <Card className="w-full mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Auth Status</h2>
          {loading && <p>Loading Auth State...</p>}
          {!loading && currentUser && (
            <div>
              <p className="text-green-700 dark:text-green-400">Signed in!</p>
              <p className="text-sm break-all text-gray-600 dark:text-gray-400">User ID: {currentUser.uid}</p>
              <p className="text-xs text-gray-500">(This is an anonymous user)</p>
            </div>
          )}
          {!loading && !currentUser && <p className="text-red-600 dark:text-red-400">Not signed in.</p>}
        </Card> */}

        {!loading && currentUser && (
          <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
            {/* Left Column: Profile Selection */}
            <div className="w-full xl:w-1/3 flex-shrink-0">
              <AnimalProfileList 
                selectedProfiles={selectedProfiles} 
                onSelectProfile={handleProfileSelectToggle} 
              /> 
            </div>

            {/* Right Column: Photo Selection & Generation */}
            <div className="w-full xl:w-2/3 flex flex-col gap-6">
              {selectedProfiles.length > 0 && (
                <Card className="w-full">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">Select Photos for Generation</h3>
                  {/* Replace placeholder with the actual component */}
                  <SelectedPhotosPanel
                    selectedProfiles={selectedProfiles}
                    selectedPhotos={selectedPhotos}
                    onSelectPhoto={handlePhotoSelect}
                  />
                </Card>
              )}

              {/* Conditionally render generation panel only if there are selected profiles */}
              {selectedProfiles.length > 0 && (
                <ImageGenerationPanel 
                  selections={generationSelections} // Pass the list of {profileId, photoId} pairs
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
