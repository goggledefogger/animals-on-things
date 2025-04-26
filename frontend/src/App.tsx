import React, { useState } from 'react'; // Import useState
import { useAuth } from './contexts/AuthContext'; // Corrected import path
import { AnimalProfileList } from './components/features/AnimalProfileList'; // Import the new component
import { PhotoGallery } from './components/features/PhotoGallery'; // Import PhotoGallery
import { Card } from './components/common/Card'; // Import Card
import { AnimalProfile } from './types/AnimalProfile'; // Import AnimalProfile type

function App() {
  // Get auth state from context
  // Destructure currentUser and loading from the context value
  const { currentUser, loading } = useAuth();
  // State to manage the selected profile - lifted up from AnimalProfileList
  const [selectedProfile, setSelectedProfile] = useState<AnimalProfile | null>(null);

  // Removed the useEffect hook that handled auth state changes
  // as this logic is now encapsulated in AuthProvider

  return (
    // Apply base layout: flex column, center items, min height, padding, background color
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 p-4">
      
      {/* App Title - Larger and more prominent */}
      <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 dark:text-indigo-300 my-6 md:my-8">
        Animals On Things
      </h1>

      {/* Use Card for Auth Status */}
      <Card className="w-full max-w-lg mb-6"> {/* Use consistent max-w */}
        <h2 className="text-xl font-semibold mb-2">Auth Status</h2>
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

      {/* Animal Profiles Section - Render conditionally */}
      {!loading && currentUser && (
        <AnimalProfileList 
          selectedProfile={selectedProfile} // Pass selected profile down
          onSelectProfile={setSelectedProfile} // Pass handler down
        /> 
      )}

      {/* Render photo gallery only when authenticated AND a profile is selected */} 
      {!loading && currentUser && selectedProfile && (
        <PhotoGallery 
          key={selectedProfile.id} // Add key to force re-render/re-fetch when profile changes
          profileId={selectedProfile.id} 
          profileName={selectedProfile.name} 
        />
      )}

      {/* Footer or other sections can go here */}

    </div>
  );
}

export default App;
