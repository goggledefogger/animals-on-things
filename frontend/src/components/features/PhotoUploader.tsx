import React, { useState, ChangeEvent } from 'react';
import { getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import { getDatabase, ref as dbRef, push, serverTimestamp } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input'; // Assuming Input is a styled wrapper
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

interface PhotoUploaderProps {
  profileId: string; // ID of the profile to associate the photo with
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ profileId }) => {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null); // Clear previous errors
      setUploadSuccess(false);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser || !profileId) {
      setUploadError('No file selected or user/profile not available.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const storage = getStorage();
      const db = getDatabase();

      // Generate unique path
      const fileExtension = selectedFile.name.split('.').pop();
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const storagePath = `profiles/${currentUser.uid}/${profileId}/${uniqueFilename}`;
      const imageRef = storageRef(storage, storagePath);

      // Upload to Storage
      console.log(`Uploading to: ${storagePath}`);
      await uploadBytes(imageRef, selectedFile);
      console.log('Upload successful');

      // Add metadata to Realtime Database
      const photosRef = dbRef(db, `profiles/${currentUser.uid}/${profileId}/photos`);
      const newPhotoData = {
        storagePath: storagePath,
        filename: selectedFile.name, // Store original filename too?
        contentType: selectedFile.type,
        size: selectedFile.size,
        createdAt: serverTimestamp(), // Use server timestamp for consistency
      };
      await push(photosRef, newPhotoData);
      console.log('Metadata added to Realtime Database');

      setUploadSuccess(true);
      setSelectedFile(null); // Clear selection after successful upload
      // Clear the file input visually (requires a bit of a trick)
      const fileInput = document.getElementById('photo-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : 'An unknown error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="my-4 p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 shadow-sm">
      <h4 className="text-md font-medium mb-2 text-gray-600 dark:text-gray-300">Upload New Photo</h4>
      <div className="flex items-center space-x-2">
        <Input
          id="photo-upload-input" // ID for clearing the input
          type="file"
          accept="image/*" // Accept only image files
          onChange={handleFileChange}
          className="flex-grow text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900/70 dark:text-gray-400" // Basic file input styling
          disabled={isUploading}
        />
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      {uploadError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">Error: {uploadError}</p>}
      {uploadSuccess && <p className="mt-2 text-sm text-green-600 dark:text-green-400">Photo uploaded successfully!</p>}
    </div>
  );
}; 