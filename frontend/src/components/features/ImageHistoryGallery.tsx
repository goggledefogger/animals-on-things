import React, { useState } from 'react';
import { useImageHistory, type ImageHistoryItem } from '../../hooks/useImageHistory';
import { useImageHistoryDeletion } from '../../hooks/useImageHistoryDeletion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner'; // Now exists

/**
 * Formats a Unix timestamp (in milliseconds) into a readable date string.
 */
const formatDate = (timestamp: number): string => {
  if (!timestamp) return 'Unknown date';
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

/**
 * Component to display the user's generated image history.
 */
export const ImageHistoryGallery: React.FC = () => {
  const { historyItems, isLoading, error, fetchHistory } = useImageHistory();
  const { deleteHistoryImage, deletionError } = useImageHistoryDeletion();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadClick = async (imageUrl: string, filename: string, generatedImageId: string) => {
    setDownloadingId(generatedImageId);
    setDownloadError(null);
    console.log(`Attempting to download: ${imageUrl} as ${filename}`);

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);

      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err: unknown) {
      console.error("Download failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred during download.";
      setDownloadError(`Failed to download image: ${message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteClick = async (item: ImageHistoryItem) => {
    if (window.confirm(`Are you sure you want to delete the image generated on ${formatDate(item.createdAt)}? This cannot be undone.`)) {
        setDeletingId(item.generatedImageId);
        const success = await deleteHistoryImage({ generatedImageId: item.generatedImageId });
        if (success) {
            console.log('History item deleted, refreshing history...');
            fetchHistory(); // Refetch the history list
        } else {
            // Error is handled by the hook and displayed below
            console.error("Deletion failed.");
            // Optionally show an alert: alert(`Deletion failed: ${deletionError}`);
        }
        setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner />
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading image history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700">
        <div className="text-center text-red-700 dark:text-red-300">
          <p className="font-semibold">Error loading history:</p>
          <p className="text-sm mb-4">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchHistory}>Try Again</Button>
        </div>
      </Card>
    );
  }

  if (historyItems.length === 0) {
    return (
      <Card className="mt-6">
        <p className="text-center text-gray-500 dark:text-gray-400">You haven't generated any images yet!</p>
      </Card>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold font-nunito mb-4 text-gray-800 dark:text-gray-200">Image History</h2>
      {deletionError && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-4 text-center">Error deleting image: {deletionError}</p>
      )}
      {downloadError && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-4 text-center">{downloadError}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {historyItems.map((item) => {
          const isDownloadingThis = downloadingId === item.generatedImageId;
          const isDeletingThis = deletingId === item.generatedImageId;
          return (
            <Card key={item.generatedImageId} className="overflow-hidden flex flex-col">
              <div className="w-full h-48 bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={`Generated image from ${formatDate(item.createdAt)}`}
                  className="object-contain w-full h-full"
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{formatDate(item.createdAt)}</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">Style: {item.style}</p>
                  {item.prompt && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 overflow-hidden overflow-ellipsis whitespace-nowrap" title={item.prompt}>
                      Prompt: {item.prompt}
                    </p>
                  )}
                </div>
                <div className="mt-3 text-right flex justify-end space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadClick(item.imageUrl, `generated_${item.generatedImageId.substring(0, 8)}.png`, item.generatedImageId)}
                    disabled={isDownloadingThis || isDeletingThis}
                  >
                    {isDownloadingThis ? <Spinner /> : 'Download'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(item)}
                    disabled={isDeletingThis || isDownloadingThis}
                  >
                    {isDeletingThis ? <Spinner /> : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
