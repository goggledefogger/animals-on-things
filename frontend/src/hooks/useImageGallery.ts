import { useState } from 'react';

// Interface for a single gallery item (previously history item)
export interface GalleryItem {
  id: string;
  userId: string;
  prompt: string;
  style: string;
  model: string;
  imageUrl: string;
  createdAt: string; // Consider using Date type if appropriate
}

// Hook to manage fetching and holding image gallery data (previously history)
export function useImageGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]); // Renamed historyItems, setHistoryItems
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement actual fetch logic (e.g., from Firebase Firestore)
  const fetchGallery = () => {
    console.log('Fetching gallery data...');
    setIsLoading(true);
    setError(null);
    // Placeholder - replace with actual API call
    setTimeout(() => {
      // Example data
      const exampleData: GalleryItem[] = [
        {
          id: '1',
          userId: 'user123',
          prompt: 'A cat wearing a hat',
          style: 'cartoon',
          model: 'dall-e-3',
          imageUrl: 'https://via.placeholder.com/150/0000FF/808080?text=Image1',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'user123',
          prompt: 'A dog riding a skateboard',
          style: 'photorealistic',
          model: 'stable-diffusion-xl',
          imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Image2',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        },
      ];
      setGalleryItems(exampleData);
      setIsLoading(false);
    }, 1500);
  };

  return {
    galleryItems, // Renamed historyItems
    isLoading,
    error,
    fetchGallery, // Renamed fetchHistory
  };
}
