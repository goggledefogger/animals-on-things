import React, { useState, Dispatch, SetStateAction } from 'react';
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos';
import { Card } from '../common/Card';
import { AnimalPhotoItem } from './AnimalPhotoItem';
import { PhotoUploader } from './PhotoUploader';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref as dbRef, remove } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject } from 'firebase/storage';

interface PhotoGalleryProps {
  profileId: string;
  profileName: string;
  selectedPhotoId: string | null;
  onSelectPhoto: Dispatch<SetStateAction<string | null>>;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  profileId, 
  profileName, 
  selectedPhotoId,
  onSelectPhoto
}) => {
  const { photos, loading, error } = useAnimalPhotos(profileId);
  const { currentUser } = useAuth();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handlePhotoDelete = async (photoId: string, storagePath: string) => {
    if (!currentUser) {
      setDeleteError('User not authenticated.');
      return;
    }
    setDeleteError(null);
    if (selectedPhotoId === photoId) {
      onSelectPhoto(null);
    }
    console.log(`Attempting to delete photo: ${photoId}, path: ${storagePath}`);
    const storage = getStorage();
    const imageRef = storageRef(storage, storagePath);
    try {
      await deleteObject(imageRef);
      console.log(`Deleted from Storage: ${storagePath}`);
    } catch (err: any) {
      console.error("Error deleting photo from Storage:", err);
      if (err.code !== 'storage/object-not-found') {
        setDeleteError(`Failed to delete photo file: ${err.message}`);
        return;
      }
    }
    const db = getDatabase();
    const photoDbRef = dbRef(db, `profiles/${currentUser.uid}/${profileId}/photos/${photoId}`);
    try {
      await remove(photoDbRef);
      console.log(`Deleted from Database: profiles/.../${profileId}/photos/${photoId}`);
    } catch (err) {
      console.error("Error deleting photo metadata from Database:", err);
      setDeleteError(`Failed to delete photo data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handlePhotoSelect = (photoId: string) => {
    onSelectPhoto((prevSelectedId) => (prevSelectedId === photoId ? null : photoId));
    console.log("Selected photo (in Gallery):", photoId === selectedPhotoId ? null : photoId);
  };

  const renderGalleryContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500 dark:text-gray-400">Loading photos...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500">Error loading photos: {error.message}</p>;
    }
    if (photos.length === 0 && !loading) {
      return <p className="text-center text-gray-500 dark:text-gray-400 mt-3">No photos uploaded for this profile yet.</p>;
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 mt-3">
        {photos.map((photo) => (
          <AnimalPhotoItem
            key={photo.id}
            photo={photo}
            onDelete={handlePhotoDelete}
            isSelected={selectedPhotoId === photo.id}
            onClick={handlePhotoSelect}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full mb-4">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
        Photos for: <span className="text-indigo-600 dark:text-indigo-400">{profileName}</span>
      </h3>
      {deleteError && (
        <p className="mb-3 text-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 p-2 rounded text-sm">Error deleting photo: {deleteError}</p>
      )}
      <PhotoUploader profileId={profileId} />
      {renderGalleryContent()}
    </Card>
  );
}; 