import React from 'react';
import { useImageGallery, GalleryItem } from '../../hooks/useImageGallery';
import { Spinner } from '../common/Spinner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

/**
 * Component to display the user's generated image gallery.
 */
export const ImageGallery: React.FC = () => {
  const { galleryItems, isLoading, error, fetchGallery } = useImageGallery();

  return (
    <div className="p-4">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Spinner />
          <p className="ml-3 text-gray-600 dark:text-gray-400">Loading image gallery...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="text-center py-4 text-red-600 dark:text-red-400">
          <p className="font-semibold">Error loading gallery:</p>
          <p className="text-sm mb-2">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchGallery}>Try Again</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && galleryItems.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>No generated images found yet.</p>
          <p className="text-sm">Go generate some images!</p>
        </div>
      )}

      {/* Gallery Grid */}
      {!isLoading && !error && galleryItems.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold font-nunito mb-4 text-gray-800 dark:text-gray-200">Image Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item: GalleryItem) => {
              const filename = item.imageUrl?.split('/').pop()?.split('?')[0] || 'generated image';

              return (
                <Card key={item.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200" padding="p-0">
                  <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" title="View full image">
                    <img
                      src={item.imageUrl}
                      alt={`Generated image: ${filename}`}
                      className="w-full h-48 object-cover cursor-pointer"
                      loading="lazy"
                    />
                  </a>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={item.prompt || 'No prompt'}>
                      Prompt: {item.prompt || '-'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Style: {item.style || '-'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Model: {item.model || '-'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Generated: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
