import React, { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { AnimalPhoto } from '../../types/AnimalPhoto';
import { Button } from '../common/Button'; // Import Button

interface AnimalPhotoItemProps {
  photo: AnimalPhoto;
  onDelete: (photoId: string, storagePath: string) => void; // Callback for deletion
  isSelected: boolean; // Prop to indicate if this item is selected
  onClick: (photoId: string) => void; // Callback for selection
}

export const AnimalPhotoItem: React.FC<AnimalPhotoItemProps> = ({ photo, onDelete, isSelected, onClick }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        const storage = getStorage();
        const imageRef = ref(storage, photo.storagePath);
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
      } catch (err) {
        console.error(`Error fetching image URL for ${photo.storagePath}:`, err);
        setError(err instanceof Error ? err : new Error('Failed to load image'));
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();
  }, [photo.storagePath]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering selection click
    if (window.confirm(`Are you sure you want to delete this photo?`)) {
      onDelete(photo.id, photo.storagePath);
    }
  };

  const handleSelect = () => {
    onClick(photo.id);
  };

  // Conditional classes for selection styling
  const selectionClasses = isSelected
    ? 'ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800' // Prominent ring when selected
    : 'ring-1 ring-transparent group-hover:ring-indigo-300'; // Subtle ring on hover when not selected

  return (
    <div
      className={`aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center relative overflow-hidden group cursor-pointer ${selectionClasses} transition-all duration-150`}
      onClick={handleSelect}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect()} // Allow selection with keyboard
    >
      {/* Existing loading/error/image rendering... */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900 p-1">
          <span className="text-xs text-red-600 dark:text-red-300 text-center">Error</span>
        </div>
      )}
      {imageUrl && !loading && !error && (
        <img
          src={imageUrl}
          alt={`Animal photo ${photo.id}`}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      )}

      {/* Delete button - Adjusted styling */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <Button
          onClick={handleDelete}
          className="p-1 leading-none !bg-red-600 hover:!bg-red-700 focus:!ring-red-500 text-white rounded-full shadow-md w-5 h-5 flex items-center justify-center" // Adjusted styling for small danger button
          aria-label="Delete photo"
        >
          {/* Simple X icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {/* Overlay (optional styling element) */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-200 pointer-events-none ${isSelected ? 'bg-opacity-20' : 'bg-opacity-0 group-hover:bg-opacity-30'}`}></div>
    </div>
  );
};
 