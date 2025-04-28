import { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue, off, push, set, remove, serverTimestamp } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { type AnimalProfile } from '../types/AnimalProfile';

// // Define the shape of the data to be written to Firebase (without the id)
// interface NewAnimalProfileData {
//   name: string;
//   createdAt: number; // Actually a server timestamp placeholder
// }

interface UseAnimalProfilesReturn {
  profiles: AnimalProfile[];
  loading: boolean;
  error: string | null;
  addProfile: (name: string) => Promise<string | null>;
  deleteProfile: (profileId: string) => Promise<boolean>;
}

export function useAnimalProfiles(): UseAnimalProfilesReturn {
  const { currentUser } = useAuth();
  const [profiles, setProfiles] = useState<AnimalProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      // If user logs out or is not yet available, clear profiles and stop loading
      setProfiles([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const db = getDatabase();
    const profilesRef = ref(db, `profiles/${currentUser.uid}`);

    const unsubscribe = onValue(profilesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to array, adding the key as id
        const profilesArray: AnimalProfile[] = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as Omit<AnimalProfile, 'id'>), // Cast value, excluding id which we add manually
        }));
        setProfiles(profilesArray.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))); // Sort by creation time
      } else {
        setProfiles([]); // No profiles found
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching animal profiles:", error);
      setError("Failed to load animal profiles.");
      setLoading(false);
    });

    // Cleanup listener on component unmount or user change
    return () => {
      off(profilesRef, 'value', unsubscribe);
    };
  }, [currentUser]); // Re-run effect if user changes

  const addProfile = useCallback(async (name: string): Promise<string | null> => {
    if (!currentUser) {
      setError("User not logged in");
      return null;
    }
    if (!name.trim()) {
        setError("Profile name cannot be empty");
        return null;
    }

    try {
      const db = getDatabase();
      const userProfilesRef = ref(db, `profiles/${currentUser.uid}`);
      const newProfileRef = push(userProfilesRef);
      await set(newProfileRef, {
        name: name.trim(),
        createdAt: serverTimestamp(), // Use server timestamp
      });
      setError(null); // Clear previous errors
      return newProfileRef.key; // Return the new profile ID
    } catch (err) {
      console.error("Error adding profile:", err);
      setError("Failed to add profile.");
      return null;
    }
  }, [currentUser]);

  const deleteProfile = useCallback(async (profileId: string): Promise<boolean> => {
    if (!currentUser) {
      setError("User not logged in");
      return false;
    }
    // TODO: Also delete associated photos from Storage and DB (`photos` node)
    // This might require a Cloud Function for atomicity or more complex client logic.
    try {
      const db = getDatabase();
      const profileRef = ref(db, `profiles/${currentUser.uid}/${profileId}`);
      await remove(profileRef);
      // Note: This doesn't delete associated photos yet.
      setError(null);
      return true;
    } catch (err) {
      console.error("Error deleting profile:", err);
      setError("Failed to delete profile.");
      return false;
    }
  }, [currentUser]);

  return { profiles, loading, error, addProfile, deleteProfile };
}
