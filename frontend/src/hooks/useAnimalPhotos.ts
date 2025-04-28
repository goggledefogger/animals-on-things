import { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue, off, push, set, serverTimestamp, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { type AnimalPhoto } from '../types/AnimalPhoto';
import { v4 as uuidv4 } from 'uuid';

interface UseAnimalPhotosReturn {
  photos: AnimalPhoto[];
  loading: boolean;
  error: string | null;
  uploadPhoto: (file: File) => void;
  uploadProgress: number | null;
  uploadError: string | null;
  isUploading: boolean;
  deletePhoto: (photo: AnimalPhoto) => Promise<boolean>;
}

// Hook accepts the profileId, which can be null if no profile is selected
export function useAnimalPhotos(profileId: string | null): UseAnimalPhotosReturn {
  const { currentUser } = useAuth();
  const [photos, setPhotos] = useState<AnimalPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have a user and a valid profileId
    if (!currentUser || !profileId) {
      setPhotos([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const db = getDatabase();
    // Construct the path to the photos for the specific profile
    const photosRef = ref(db, `profiles/${currentUser.uid}/${profileId}/photos`);

    const unsubscribe = onValue(photosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase photo object to array
        const photosArray: AnimalPhoto[] = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as Omit<AnimalPhoto, 'id'>),
        }));
        // Sort photos, e.g., newest first
        setPhotos(photosArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      } else {
        setPhotos([]); // No photos found
      }
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching photos for profile ${profileId}:`, error);
      setError(`Failed to load photos for profile.`);
      setLoading(false);
    });

    // Cleanup listener
    return () => {
      off(photosRef, 'value', unsubscribe);
    };
    // Re-run effect if user or profileId changes
  }, [currentUser, profileId]);

  // Function to upload a new photo
  const uploadPhoto = useCallback((file: File) => {
    if (!currentUser || !profileId || !file) {
      setUploadError("Cannot upload: Missing user, profile, or file.");
      return;
    }
    if (!file.type.startsWith('image/')) {
        setUploadError("Invalid file type. Please upload an image.");
        return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const newStoragePath = `users/${currentUser.uid}/profiles/${profileId}/${uniqueFileName}`;
    const fileRef = storageRef(storage, newStoragePath);

    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploadError(`Upload failed: ${error.message}`);
        setIsUploading(false);
        setUploadProgress(null);
      },
      async () => {
        console.log('File available at', newStoragePath);
        try {
          const db = getDatabase();
          const photosDbRef = ref(db, `profiles/${currentUser.uid}/${profileId}/photos`);
          const newPhotoRef = push(photosDbRef);
          await set(newPhotoRef, {
            storagePath: newStoragePath,
            createdAt: serverTimestamp(),
          });
          console.log("Photo metadata saved to RTDB");
          setIsUploading(false);
          setUploadProgress(null);
          setUploadError(null);
        } catch (dbError) {
            console.error("Failed to save photo metadata to RTDB:", dbError);
            setUploadError("Upload succeeded but failed to save metadata.");
            setIsUploading(false);
            setUploadProgress(null);
        }
      }
    );
  }, [currentUser, profileId]);

  // Function to delete a photo
  const deletePhoto = useCallback(async (photo: AnimalPhoto): Promise<boolean> => {
    if (!currentUser || !profileId) {
      setError("Cannot delete: Missing user or profile context.");
      return false;
    }

    const { id: photoId, storagePath } = photo;

    if (!window.confirm(`Are you sure you want to delete this photo?`)) {
        return false;
    }

    try {
      const storage = getStorage();
      const fileRef = storageRef(storage, storagePath);
      await deleteObject(fileRef);
      console.log("Photo deleted from Storage:", storagePath);

      const db = getDatabase();
      const photoDbRef = ref(db, `profiles/${currentUser.uid}/${profileId}/photos/${photoId}`);
      await remove(photoDbRef);
      console.log("Photo metadata deleted from RTDB:", photoId);

      setError(null);
      return true;
    } catch (err) {
      console.error("Error deleting photo:", err);
      setError("Failed to delete photo.");
      return false;
    }
  }, [currentUser, profileId]);

  return {
      photos,
      loading,
      error,
      uploadPhoto,
      isUploading,
      uploadProgress,
      uploadError,
      deletePhoto
    };
}
