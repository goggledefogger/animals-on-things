import { useState, useCallback, useEffect } from 'react';
import { getFunctions, httpsCallable, FunctionsError } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';

// Define the structure of a single history item, matching the backend function's return type
// It's good practice to define types on the frontend as well.
export interface ImageHistoryItem {
    generatedImageId: string; // Added by the backend function
    style: string;
    prompt: string | null;
    profileIds: string[];
    photoIds: string[];
    imageUrl: string;
    model: string;
    finalPrompt: string;
    createdAt: number;
}

interface UseImageHistoryReturn {
  historyItems: ImageHistoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => void; // Function to manually trigger a fetch
}

/**
 * Custom hook to fetch and manage the user's generated image history.
 */
export function useImageHistory(): UseImageHistoryReturn {
  const { currentUser } = useAuth();
  const [historyItems, setHistoryItems] = useState<ImageHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!currentUser) {
      // Don't attempt to fetch if user is not logged in
      // setError("User not authenticated."); // Optionally set error, or just return
      setHistoryItems([]); // Clear any previous history
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('Fetching image history...');

    try {
      const functions = getFunctions();
      // Ensure the function name matches the deployed function
      const getImageHistoryFunction = httpsCallable<never, ImageHistoryItem[]>(functions, 'getImageHistory');

      const result = await getImageHistoryFunction(); // No input data needed

      setHistoryItems(result.data || []); // Set data, default to empty array if undefined
      console.log(`Fetched ${result.data?.length || 0} history items.`);

    } catch (err: unknown) {
      console.error("Failed to fetch image history:", err);
      let message = 'An unexpected error occurred while fetching history.';
      if (err instanceof FunctionsError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setHistoryItems([]); // Clear history on error
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Optional: Fetch history automatically when the hook mounts and user is available
  // Remove this useEffect if you prefer manual fetching via the returned `fetchHistory` function
  useEffect(() => {
    if (currentUser) {
      fetchHistory();
    } else {
        // Clear history if user logs out or isn't available on mount
        setHistoryItems([]);
        setError(null);
    }
  }, [currentUser, fetchHistory]); // Rerun if user changes or fetchHistory function identity changes

  return {
    historyItems,
    isLoading,
    error,
    fetchHistory, // Expose fetch function for manual refresh
  };
}
