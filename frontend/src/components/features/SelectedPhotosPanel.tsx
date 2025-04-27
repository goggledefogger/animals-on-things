import React from 'react';
import { AnimalProfile } from '../../types/AnimalProfile';
import { SelectedPhotoMap } from '../../App'; // Import the type from App
// We'll need useAnimalPhotos to fetch photos for each profile
import { useAnimalPhotos } from '../../hooks/useAnimalPhotos'; 
import { Button } from '../common/Button'; // Example: Button to clear selection
import { PhotoThumbnail } from '../common/PhotoThumbnail'; // Import the new component
import { PhotoUploader } from './PhotoUploader'; // Import the uploader

interface SelectedPhotosPanelProps {
  selectedProfiles: AnimalProfile[];
  selectedPhotos: SelectedPhotoMap;
  onSelectPhoto: (profileId: string, photoId: string | null) => void;
}

// Component to display a mini-gallery and uploader for a single profile
const MiniPhotoGallery: React.FC<{
  profileId: string;
  currentSelectedPhotoId: string | null;
  onSelect: (photoId: string | null) => void;
}> = ({ profileId, currentSelectedPhotoId, onSelect }) => {
  const { photos, loading, error } = useAnimalPhotos(profileId);

  return (
    <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2 py-3 space-y-3">
      {/* Photo Thumbnails */}
      <div>
        {loading && <p className="text-xs text-gray-400 italic">Loading photos...</p>}
        {error && <p className="text-xs text-red-500 italic">Error loading photos.</p>}
        {!loading && !error && photos.length === 0 && <p className="text-xs text-gray-500 italic">No photos available.</p>}
        {!loading && !error && photos.length > 0 && (
           <div className="flex flex-wrap items-center gap-2">
            {photos.map(photo => {
              const isSelected = photo.id === currentSelectedPhotoId;
              return (
                <PhotoThumbnail
                  key={photo.id}
                  storagePath={photo.storagePath} // Use storagePath
                  altText={`Photo for profile ${profileId}`}
                  className={`w-12 h-12 object-cover rounded-md transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-800' : 'opacity-70 hover:opacity-100'}`}
                  onClick={() => onSelect(isSelected ? null : photo.id)} // Toggle selection
                  title={`Select photo ${photo.id.substring(0, 6)}...`}
                />
              );
            })}
            {/* Optional: Add button to clear selection for this profile */} 
            {currentSelectedPhotoId && (
              <Button 
                onClick={() => onSelect(null)} 
                className="h-9 px-2 self-center text-xs bg-transparent border-none shadow-none text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-0 focus:ring-offset-0"
                title="Clear selection for this profile"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Photo Uploader (Integrated) */}
      <PhotoUploader profileId={profileId} />
    </div>
  );
};

export const SelectedPhotosPanel: React.FC<SelectedPhotosPanelProps> = ({ 
  selectedProfiles, 
  selectedPhotos, 
  onSelectPhoto 
}) => {
  return (
    <div className="space-y-4 md:space-y-5">
      {selectedProfiles.map(profile => (
        <div key={profile.id}>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {profile.name}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              ({selectedPhotos[profile.id] ? `Photo ${selectedPhotos[profile.id]?.substring(0, 6)}... selected` : 'Select a photo below'})
            </span>
          </h4>
          <MiniPhotoGallery 
            profileId={profile.id}
            currentSelectedPhotoId={selectedPhotos[profile.id] || null}
            onSelect={(photoId) => onSelectPhoto(profile.id, photoId)}
          />
        </div>
      ))}
    </div>
  );
}; 