import React, { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

interface PhotoThumbnailProps {
  storagePath: string;
  altText: string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({ 
  storagePath, 
  altText, 
  className,
  onClick,
  title
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        const storage = getStorage();
        const imageRef = ref(storage, storagePath);
        const url = await getDownloadURL(imageRef);
        if (isMounted) {
          setImageUrl(url);
        }
      } catch (err) { // Explicitly type err
        console.error(`Error fetching download URL for ${storagePath}:`, err);
        if (isMounted) {
          // Handle specific Firebase Storage errors if needed
          if (err instanceof Error && (err as any).code === 'storage/object-not-found') {
             setError('Image not found.');
          } else {
             setError('Failed to load');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUrl();

    return () => {
      isMounted = false;
    };
  }, [storagePath]); // Re-fetch if storagePath changes

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className || 'w-10 h-10'}`}>
        {/* Optional: Add a spinner SVG or icon here */} 
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs text-center ${className || 'w-10 h-10'}`}
        title={error || 'Image URL not available'}
      >
        ! {/* Simple error indicator */}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={altText}
      className={`${className || 'w-10 h-10 object-cover rounded'} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      title={title}
    />
  );
}; 