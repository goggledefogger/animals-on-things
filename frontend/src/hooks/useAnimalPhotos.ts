import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { AnimalPhoto } from '../types/AnimalPhoto';

interface UseAnimalPhotosReturn {
  photos: AnimalPhoto[];
  loading: boolean;
  error: Error | null;
}

// Hook accepts the profileId, which can be null if no profile is selected
export const useAnimalPhotos = (profileId: string | null): UseAnimalPhotosReturn => {
  const { currentUser } = useAuth();
  const [photos, setPhotos] = useState<AnimalPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Start loading only when profileId is valid
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only fetch if we have a user and a selected profileId
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

    const listener = onValue(photosRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert the Firebase object { photoId1: {storagePath: ...}, photoId2: {...} } 
          // into an array [{ id: photoId1, storagePath: ...}, { id: photoId2, ... }]
          const photosArray: AnimalPhoto[] = Object.entries(data).map(([id, photoData]) => ({
            id,
            ...(photoData as Omit<AnimalPhoto, 'id'>), // Cast type
          }));
          // Optional: Sort photos, e.g., by creation date descending
          photosArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setPhotos(photosArray);
        } else {
          setPhotos([]); // No photos found for this profile
        }
      } catch (err) {
        console.error("Error processing photo data:", err);
        setError(err instanceof Error ? err : new Error('Failed to parse photo data'));
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching photos:", err);
      setError(err);
      setPhotos([]);
      setLoading(false);
    });

    // Cleanup listener on unmount or when profileId/currentUser changes
    return () => {
      off(photosRef, 'value', listener);
    };
    // Depend on currentUser and profileId
  }, [currentUser, profileId]); 

  return { photos, loading, error };
}; 