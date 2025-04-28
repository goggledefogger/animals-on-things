import React, { useRef } from 'react';
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos';
import { Button } from '../common/Button';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface PhotoUploaderProps {
  profileId: string; // We need to know which profile to upload for
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ profileId }) => {
  // Use the hook, but only need upload-related functions/state here
  const { uploadPhoto, isUploading, uploadProgress, uploadError } = useAnimalPhotos(profileId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const fileToUpload = event.target.files[0]; // Get the file
      // Automatically trigger upload upon file selection
      if (uploadPhoto) {
        uploadPhoto(fileToUpload);
      } else {
        // This case should ideally not happen if profileId is valid
        console.error("Upload function not available");
      }
       // Clear the input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    // Trigger the hidden file input click
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Upload New Photo</h4>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*" // Accept only image files
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} // Hide the default input
        disabled={isUploading}
      />

      {/* Upload Button - Using variants/sizes */}
      <Button
        variant="secondary" // Use secondary style
        size="md" // Use medium size
        onClick={handleButtonClick}
        disabled={isUploading}
        className="inline-flex items-center" // No need for justify-center if left-aligned
      >
        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
        {isUploading ? `Uploading... (${uploadProgress !== null ? uploadProgress.toFixed(0) : 0}%)` : 'Select Photo to Upload'}
      </Button>

      {/* Progress Bar & Error Message */}
      {(isUploading || uploadError) && (
        <div className="mt-3"> {/* Container for progress/error */}
          {isUploading && uploadProgress !== null && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-150 ease-linear"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          {uploadError && (
            <p className="text-red-500 text-sm mt-2">Error: {uploadError}</p>
          )}
        </div>
      )}

      {/* Remove selected file display as upload starts immediately */}
      {/* {selectedFile && !isUploading && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Selected: {selectedFile.name}</p>
      )} */}
    </div>
  );
};
