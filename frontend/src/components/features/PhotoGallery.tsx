import React from 'react';
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos';
import { PhotoThumbnail } from '../common/PhotoThumbnail';
import { Spinner } from '../common/Spinner';

interface MiniPhotoGalleryProps {
  profileId: string;
  profileName: string;
  selectedPhotoId: string | null;
  onPhotoSelect: (profileId: string, photoId: string) => void;
}

/**
 * A simplified gallery specifically for displaying thumbnails
 * within the SelectedPhotosPanel, handling selection.
 */
export const MiniPhotoGallery: React.FC<MiniPhotoGalleryProps> = ({
    profileId,
    profileName,
    selectedPhotoId,
    onPhotoSelect
}) => {
  const { photos, loading, error } = useAnimalPhotos(profileId);

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
      {photos.map((photo) => (
        <PhotoThumbnail
          key={photo.id}
          storagePath={photo.storagePath}
          altText={`Photo for ${profileName}`}
          className={`w-full h-16 object-cover rounded cursor-pointer border-2 ${selectedPhotoId === photo.id ? 'border-sky-500 ring-1 ring-sky-300' : 'border-transparent hover:border-gray-400'}`}
          onClick={() => onPhotoSelect(profileId, photo.id)}
        />
      ))}
    </div>
  );
};
