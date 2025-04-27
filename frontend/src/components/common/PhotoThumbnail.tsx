import React, { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { PhotoIcon, ExclamationCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button } from './Button';

interface PhotoThumbnailProps {
  storagePath: string;
  altText: string;
  isSelected?: boolean; // Optional: for selection indication
  onClick?: () => void; // Optional: for selection handling
  onDelete?: () => void; // Add delete callback prop
  className?: string; // Allow custom styling
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
  storagePath,
  altText,
  isSelected = false,
  onClick,
  onDelete,
  className = ''
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storagePath) {
        setLoading(false);
        setError("No storage path provided.");
        return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    const storage = getStorage();
    const imageRef = ref(storage, storagePath);

    getDownloadURL(imageRef)
      .then((url) => {
        if (isMounted) {
          setImageUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error getting download URL:", storagePath, err);
        if (isMounted) {
          setError("Failed to load image");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false; // Prevent state updates on unmounted component
    };
  }, [storagePath]); // Re-fetch if storagePath changes

  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click when deleting
      if (onDelete) {
          // Confirmation is handled in the hook, just call onDelete
          onDelete();
      } else {
          console.warn("onDelete handler not provided to PhotoThumbnail");
      }
  }

  const baseClasses =
    'relative group aspect-square w-full rounded-md object-cover border-2 overflow-hidden';
  const selectedClasses = isSelected
    ? 'border-green-500 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-800'
    : 'border-transparent hover:border-gray-400 dark:hover:border-gray-500';
  const placeholderClasses =
    'flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500';

  return (
    <div
        className={`${baseClasses} ${isSelected ? selectedClasses : 'border-gray-300 dark:border-gray-600'} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
        title={altText}
    >
      <div className={`w-full h-full ${placeholderClasses}`}>
        {loading && (
          <PhotoIcon className="h-8 w-8 animate-pulse" />
        )}
        {error && !loading && (
          <ExclamationCircleIcon className="h-8 w-8 text-red-400" title={error || 'Error'} />
        )}
        {!loading && !error && imageUrl && (
          <img
            src={imageUrl}
            alt={altText}
            className={`w-full h-full object-cover`}
          />
        )}
        {!loading && !error && !imageUrl && (
          <PhotoIcon className="h-8 w-8" />
        )}
      </div>

      {/* Delete Button Overlay - visible on group hover */}
      {/* Show delete button if handler exists and not initially loading */}
      {onDelete && !loading && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteClick}
                className="p-1 leading-none" // Make it smaller
                title="Delete Photo"
            >
                <TrashIcon className="h-3 w-3" />
            </Button>
        </div>
      )}
    </div>
  );
};
