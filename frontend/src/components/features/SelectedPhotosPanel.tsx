import React from 'react';
import { Card } from '../common/Card';
import { AnimalProfile } from '../../types/AnimalProfile';
import { PhotoUploader } from './PhotoUploader';
import { MiniPhotoGallery } from './PhotoGallery'; // Correct the import path
import { SelectedPhotoMap } from '../../App'; // Import type from App

// Define input type for the delete handler prop
interface DeletePhotoInput {
  profileId: string;
  photoId: string;
  storagePath: string;
}

interface SelectedPhotosPanelProps {
  selectedProfiles: AnimalProfile[];
  selectedPhotoMap: SelectedPhotoMap;
  onPhotoSelect: (profileId: string, photoId: string | null) => void;
  onDeletePhoto: (input: DeletePhotoInput) => Promise<boolean>;
  isDeletingPhoto: boolean;
  photoDeletionError: string | null;
}

export const SelectedPhotosPanel: React.FC<SelectedPhotosPanelProps> = ({
    selectedProfiles,
    selectedPhotoMap,
    onPhotoSelect,
    onDeletePhoto,
    isDeletingPhoto,
    photoDeletionError
}) => {

  if (selectedProfiles.length === 0) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <p className="text-center text-gray-500 dark:text-gray-400 italic">Select one or more animal profiles to begin.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-gray-800/50">
      <h4 className="text-lg font-semibold font-nunito mb-4 text-gray-800 dark:text-gray-200">Select Photo for Generation</h4>
      <div className="space-y-4">
        {selectedProfiles.map(profile => (
          <div key={profile.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">{profile.name}</p>
            {/* Use MiniPhotoGallery */}
            <MiniPhotoGallery
              profileId={profile.id}
              profileName={profile.name}
              selectedPhotoId={selectedPhotoMap[profile.id] || null}
              onPhotoSelect={onPhotoSelect}
              onDeletePhoto={onDeletePhoto}
              isDeletingPhoto={isDeletingPhoto}
              photoDeletionError={photoDeletionError}
            />
            <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                <PhotoUploader profileId={profile.id} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
