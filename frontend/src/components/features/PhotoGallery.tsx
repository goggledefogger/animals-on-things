import React, { useState, useEffect } from 'react';
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos';
import { PhotoThumbnail } from '../common/PhotoThumbnail';
import { Spinner } from '../common/Spinner';
import { Button } from '../common/Button';
import { TrashIcon } from '@heroicons/react/24/solid';
import { AnimalPhoto } from '../../types/AnimalPhoto';

interface MiniPhotoGalleryProps {
  profileId: string;
  profileName: string;
  selectedPhotoId: string | null;
  onPhotoSelect: (profileId: string, photoId: string | null) => void;
  onDeletePhoto: (input: { profileId: string; photoId: string; storagePath: string }) => Promise<boolean>;
}

/**
 * A simplified gallery specifically for displaying thumbnails
 * within the SelectedPhotosPanel, handling selection and deletion.
 */
export const MiniPhotoGallery: React.FC<MiniPhotoGalleryProps> = ({
    profileId,
    profileName,
    selectedPhotoId,
    onPhotoSelect,
    onDeletePhoto
}) => {
  const { photos, loading, error } = useAnimalPhotos(profileId);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Effect for auto-selecting the first photo
  useEffect(() => {
    // Debug Logging
    console.log(`[AutoSelect Effect Debug - Profile: ${profileId}] Running Effect.`, {
        loading,
        error: !!error,
        photosLength: photos.length,
        selectedPhotoId,
        canSelect: !!onPhotoSelect
    });

    // Auto-select logic
    if (!loading && !error && photos.length === 1 && selectedPhotoId === null && onPhotoSelect) {
      console.log(`[AutoSelect Effect - Profile: ${profileId}] CONDITIONS MET. Auto-selecting photo: ${photos[0].id}`);
      onPhotoSelect(profileId, photos[0].id);
    } 
    // Log reasons for not selecting (when not loading/error)
    else if (!loading && !error) { 
        let reason = [];
        if (!onPhotoSelect) reason.push('onPhotoSelect prop missing');
        if (photos.length !== 1) reason.push(`photos.length is ${photos.length} (needs 1)`);
        if (selectedPhotoId !== null) reason.push(`selectedPhotoId is ${selectedPhotoId} (needs null)`);
        if (reason.length > 0) {
             console.log(`[AutoSelect Effect Debug - Profile: ${profileId}] Conditions NOT met: ${reason.join(', ')}`);
        }
    } else if (loading) {
        console.log(`[AutoSelect Effect Debug - Profile: ${profileId}] Skipped check (loading)`);
    } else if (error) {
        console.log(`[AutoSelect Effect Debug - Profile: ${profileId}] Skipped check (error)`);
    }

  }, [loading, error, photos, selectedPhotoId, onPhotoSelect, profileId]); 

  const handleDeleteClick = async (e: React.MouseEvent, photo: AnimalPhoto) => {
    e.stopPropagation();
    setDeletingPhotoId(photo.id);
    setDeleteError(null);
    const success = await onDeletePhoto({
        profileId: profileId,
        photoId: photo.id,
        storagePath: photo.storagePath
    });
    if (!success) {
      setDeleteError("Failed to delete photo.");
    }
    setDeletingPhotoId(null);
  };

  // --- Render Logic --- 
  if (loading) {
    return (
        <div className="flex justify-center items-center h-20">
             <Spinner />
        </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 text-xs px-1">Error: {error}</p>;
  }

  if (photos.length === 0) {
    return <p className="text-xs text-gray-400 italic px-1">No photos yet.</p>;
  }

  // Render the grid if photos exist
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1"> 
      {deleteError && <p className="col-span-full text-xs text-red-500 text-center mb-1">{deleteError}</p>}
      {photos.map((photo) => {
        const isDeletingThis = deletingPhotoId === photo.id;
        const isSelected = selectedPhotoId === photo.id;
        return (
          <div key={photo.id} className="relative group">
            <PhotoThumbnail
              storagePath={photo.storagePath}
              altText={`Photo for ${profileName}`}
              className={`w-full aspect-square object-cover rounded cursor-pointer border-2 ${isDeletingThis ? 'opacity-50' : ''} ${isSelected ? 'border-sky-500 ring-4 ring-sky-300' : 'border-transparent hover:border-gray-400'}`}
              onClick={() => !isDeletingThis && onPhotoSelect(profileId, photo.id)}
            />
            {/* Delete Button (visible only if selected) */} 
            {isSelected && !isDeletingThis && (
                <Button
                    variant="danger"
                    size="sm"
                    className="absolute top-0.5 right-0.5 p-0.5 !rounded-full transition-opacity"
                    onClick={(e) => handleDeleteClick(e, photo)}
                    disabled={isDeletingThis} 
                    aria-label="Delete photo"
                    title="Delete photo"
                >
                   <TrashIcon className="w-3 h-3" />
                </Button>
            )}
            {/* Spinner (visible only if deleting this one) */} 
            {isDeletingThis && (
                <div className="absolute top-0.5 right-0.5 p-0.5">
                    <Spinner />
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
