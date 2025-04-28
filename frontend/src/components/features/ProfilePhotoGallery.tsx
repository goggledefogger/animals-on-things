import React from 'react';
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos';
import { PhotoThumbnail } from '../common/PhotoThumbnail';
import { type AnimalPhoto } from '../../types/AnimalPhoto';

interface ProfilePhotoGalleryProps {
  profileId: string; // The ID of the profile whose photos we want to display
  // Add props for selection handling
  selectedPhotoId?: string | null;
  onPhotoSelect?: (photoId: string | null) => void; // Can deselect by clicking selected?
  isSelectable?: boolean; // To differentiate behavior if needed
}

export const ProfilePhotoGallery: React.FC<ProfilePhotoGalleryProps> = ({
  profileId,
  // Destructure new props
  selectedPhotoId = null,
  onPhotoSelect,
  isSelectable = false
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

  // Handler for photo click (select/deselect)
  const handlePhotoClick = (photoId: string) => {
    if (!isSelectable || !onPhotoSelect) return; // Only handle click if selectable

    // If clicking the already selected photo, deselect it (set to null)
    if (photoId === selectedPhotoId) {
      onPhotoSelect(null);
    } else {
      onPhotoSelect(photoId);
    }
  };

  // Handler for delete click
  const handleDelete = (photo: AnimalPhoto) => {
    // Deselect if deleting the selected photo
    if (photo.id === selectedPhotoId && onPhotoSelect) {
        onPhotoSelect(null);
    }
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
          // Determine if this thumbnail is selected
          isSelected={isSelectable && photo.id === selectedPhotoId}
          // Pass click handler if selectable
          onClick={isSelectable ? () => handlePhotoClick(photo.id) : undefined}
          // Pass delete handler (always available if photo exists)
          onDelete={() => handleDelete(photo)}
        />
      ))}
    </div>
  );
};
