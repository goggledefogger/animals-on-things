import React from 'react';
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos';
import { Card } from '../common/Card'; // Re-use Card for consistency

interface PhotoGalleryProps {
  profileId: string; // Expect a valid profileId
  profileName: string; // For displaying in the title
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ profileId, profileName }) => {
  const { photos, loading, error } = useAnimalPhotos(profileId);

  const renderGalleryContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500 dark:text-gray-400">Loading photos...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500">Error loading photos: {error.message}</p>;
    }
    if (photos.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400">No photos uploaded for this profile yet.</p>;
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-square bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
            {/* Placeholder: Show ID or path for now */}
            <span className="text-xs text-gray-500 dark:text-gray-300 p-1 break-all" title={photo.storagePath}>{photo.id}</span>
            {/* TODO: Render actual image using photo.storagePath */}
            {/* TODO: Add delete button for photo */}
            {/* TODO: Add ability to select photo for generation */}
          </div>
        ))}
      </div>
    );
  };

  return (
    // Use Card for the gallery section
    <Card className="w-full max-w-3xl mt-6"> {/* Wider card for gallery */}
      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
        Photos for: <span className="text-indigo-600 dark:text-indigo-400">{profileName}</span>
      </h3>
      {/* TODO: Add Photo Uploader component here */}
      {renderGalleryContent()}
    </Card>
  );
}; 