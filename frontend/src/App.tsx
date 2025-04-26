import React, { useState } from 'react'; // Import useState
import { useAuth } from './contexts/AuthContext'; // Corrected import path
import { AnimalProfileList } from './components/features/AnimalProfileList'; // Import the new component
import { PhotoGallery } from './components/features/PhotoGallery'; // Import PhotoGallery
import { ImageGenerationPanel } from './components/features/ImageGenerationPanel'; // Import the new panel
import { Card } from './components/common/Card'; // Import Card
import { AnimalProfile } from './types/AnimalProfile'; // Import AnimalProfile type

function App() {
  // Get auth state from context
  // Destructure currentUser and loading from the context value
  const { currentUser, loading } = useAuth();
  // State to manage the selected profile - lifted up from AnimalProfileList
  const [selectedProfile, setSelectedProfile] = useState<AnimalProfile | null>(null);
  // Lift selectedPhotoId state up from PhotoGallery
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // When profile changes, deselect the photo
  const handleProfileSelect = (profile: AnimalProfile | null) => {
    setSelectedProfile(profile);
    setSelectedPhotoId(null); // Reset photo selection when profile changes
  };

  // Removed the useEffect hook that handled auth state changes
  // as this logic is now encapsulated in AuthProvider

  return (
    // Full-bleed background with padding
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 px-4 sm:px-6 py-6">
      
      {/* Container for content - centered with responsive max-width */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* App Title */}
        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-700 dark:text-indigo-300 mb-6 sm:mb-8">
          Animals On Things
        </h1>

        {/* Auth Status */}
        <Card className="w-full mb-4 sm:mb-6">
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
        </Card>

        {/* Animal Profiles Section */}
        {!loading && currentUser && (
          <AnimalProfileList 
            selectedProfile={selectedProfile} 
            onSelectProfile={handleProfileSelect} 
          /> 
        )}

        {/* Photo Gallery and Image Generation in flex layout on larger screens */}
        {!loading && currentUser && selectedProfile && (
          <div className="flex flex-col md:flex-row md:gap-4">
            <div className="w-full md:w-3/5">
              <PhotoGallery 
                key={selectedProfile.id}
                profileId={selectedProfile.id} 
                profileName={selectedProfile.name} 
                selectedPhotoId={selectedPhotoId}
                onSelectPhoto={setSelectedPhotoId}
              />
            </div>
            
            <div className="w-full md:w-2/5 mt-4 md:mt-0">
              <ImageGenerationPanel 
                profileId={selectedProfile.id}
                selectedPhotoId={selectedPhotoId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
