import React, { useState } from 'react';
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
  onPhotoSelect: (profileId: string, photoId: string) => void;
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

  return (
    <div className="grid grid-cols-3 gap-1 p-1">
      {deleteError && <p className="col-span-3 text-xs text-red-500 text-center mb-1">{deleteError}</p>}
      {photos.map((photo) => {
        const isDeletingThis = deletingPhotoId === photo.id;
        return (
          <div key={photo.id} className="relative group">
            <PhotoThumbnail
              storagePath={photo.storagePath}
              altText={`Photo for ${profileName}`}
              className={`w-full aspect-square object-cover rounded cursor-pointer border-2 ${isDeletingThis ? 'opacity-50' : ''} ${selectedPhotoId === photo.id ? 'border-sky-500 ring-1 ring-sky-300' : 'border-transparent hover:border-gray-400'}`}
              onClick={() => !isDeletingThis && onPhotoSelect(profileId, photo.id)}
            />
            <Button
                variant="danger"
                size="sm"
                className="absolute top-0.5 right-0.5 p-0.5 !rounded-full opacity-0 group-hover:opacity-80 hover:!opacity-100 transition-opacity focus:opacity-100"
                onClick={(e) => handleDeleteClick(e, photo)}
                disabled={isDeletingThis}
                aria-label="Delete photo"
                title="Delete photo"
            >
                {isDeletingThis ? <Spinner/> : <TrashIcon className="w-3 h-3" />}
            </Button>
          </div>
        )
      })}
    </div>
  );
};
