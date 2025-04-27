import React from 'react';
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos';
import { PhotoThumbnail } from '../common/PhotoThumbnail';
import { type AnimalPhoto } from '../../types/AnimalPhoto';

interface ProfilePhotoGalleryProps {
  profileId: string; // The ID of the profile whose photos we want to display
  // Optional props for selection, if needed later for generation setup within this view
  // selectedPhotoId?: string | null;
  // onPhotoSelect?: (photoId: string) => void;
}

export const ProfilePhotoGallery: React.FC<ProfilePhotoGalleryProps> = ({
  profileId,
  // selectedPhotoId,
  // onPhotoSelect
}) => {
  // Get deletePhoto function and errors from the hook
  const { photos, loading, error, deletePhoto, uploadError } = useAnimalPhotos(profileId);

  if (loading) {
    return <p className="text-center text-gray-500 py-4">Loading photos...</p>;
  }

  // Display general fetch error or upload error if present
  const displayError = error || uploadError;
  if (displayError) {
    return <p className="text-center text-red-500 py-4">Error: {displayError}</p>;
  }

  if (photos.length === 0) {
    return <p className="text-center text-gray-500 py-4">No photos uploaded for this profile yet.</p>;
  }

  // Handler to call the hook's delete function
  const handleDelete = (photo: AnimalPhoto) => {
    if (deletePhoto) {
      deletePhoto(photo);
    } else {
        console.error("Delete function not available from hook");
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
      {photos.map((photo: AnimalPhoto) => (
        <PhotoThumbnail
          key={photo.id}
          storagePath={photo.storagePath}
          altText={`Photo for profile ${profileId}`}
          // Pass the delete handler
          onDelete={() => handleDelete(photo)}
          // Pass down selection state/handler if needed
          // isSelected={photo.id === selectedPhotoId}
          // onClick={() => onPhotoSelect && onPhotoSelect(photo.id)}
        />
      ))}
    </div>
  );
};
