import { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue, off, push, serverTimestamp, set, remove } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { AnimalProfile } from '../types/AnimalProfile';

// Define the shape of the data to be written to Firebase (without the id)
type NewAnimalProfileData = Omit<AnimalProfile, 'id'>;

interface UseAnimalProfilesReturn {
  profiles: AnimalProfile[];
  loading: boolean;
  error: Error | null;
  addProfile: (name: string) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
}

export const useAnimalProfiles = (): UseAnimalProfilesReturn => {
  const { currentUser } = useAuth();
  const [profiles, setProfiles] = useState<AnimalProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  // Keep track of adding state separately if needed
  // const [isAdding, setIsAdding] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUser) {
      setProfiles([]);
      setLoading(false);
      // Optionally set an error or handle this case as needed
      return;
    }

    setLoading(true);
    setError(null);
    const db = getDatabase();
    const profilesRef = ref(db, `profiles/${currentUser.uid}`);

    const listener = onValue(profilesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert the Firebase object { profileId1: {name: ...}, profileId2: {...} } 
          // into an array [{ id: profileId1, name: ...}, { id: profileId2, name: ... }]
          const profilesArray: AnimalProfile[] = Object.entries(data).map(([id, profileData]) => ({
            id,
            ...(profileData as Omit<AnimalProfile, 'id'>), // Cast to ensure type safety
          }));
          // Optional: Sort profiles, e.g., by creation date
          profilesArray.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          setProfiles(profilesArray);
        } else {
          setProfiles([]); // No profiles found for the user
        }
      } catch (err) {
        console.error("Error processing profile data:", err);
        setError(err instanceof Error ? err : new Error('Failed to parse profile data'));
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching profiles:", err);
      setError(err);
      setProfiles([]);
      setLoading(false);
    });

    // Cleanup function to remove the listener when the component unmounts or currentUser changes
    return () => {
      off(profilesRef, 'value', listener);
    };
  }, [currentUser]); // Re-run effect if currentUser changes

  // Function to add a new profile
  const addProfile = useCallback(async (name: string) => {
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    if (!name || name.trim().length === 0) {
        throw new Error("Profile name cannot be empty");
    }

    // setIsAdding(true); // Indicate loading state if needed
    const db = getDatabase();
    const userProfilesRef = ref(db, `profiles/${currentUser.uid}`);
    const newProfileRef = push(userProfilesRef); // Generate a unique key

    const newProfileData: NewAnimalProfileData = {
      name: name.trim(),
      createdAt: serverTimestamp() as unknown as number, // Firebase will convert this
      // No photos initially
    };

    try {
      await set(newProfileRef, newProfileData);
      // Profile added successfully. The onValue listener will update the state.
    } catch (err) {
      console.error("Error adding profile:", err);
      // Handle error appropriately (e.g., show a notification)
      throw err; // Re-throw to be caught by the calling component
    } finally {
      // setIsAdding(false);
    }
  }, [currentUser]);

  // Function to delete a profile
  const deleteProfile = useCallback(async (profileId: string) => {
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    if (!profileId) {
      throw new Error("Profile ID is required for deletion");
    }

    const db = getDatabase();
    const profileToDeleteRef = ref(db, `profiles/${currentUser.uid}/${profileId}`);

    try {
      await remove(profileToDeleteRef);
      // Deletion successful. The onValue listener will update the state.
      console.log(`Profile ${profileId} deleted successfully.`);
      // Optional TODO: Need to also delete associated photos in Storage and RTDB photo metadata.
      // This might be better handled in a Cloud Function triggered by the profile deletion 
      // or implemented here if complexity is acceptable.
    } catch (err) {
      console.error(`Error deleting profile ${profileId}:`, err);
      throw err; // Re-throw to be caught by the calling component
    }
  }, [currentUser]);

  return { profiles, loading, error, addProfile, deleteProfile };
}; 