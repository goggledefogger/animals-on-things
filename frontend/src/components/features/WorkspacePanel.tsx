import React from 'react';
import { Card } from '../common/Card';
// Comment out or remove imports for non-existent/unused components
// import { AnimalProfileDetails } from './AnimalProfileDetails';
import { SelectedPhotosPanel } from './SelectedPhotosPanel';
import { ImageGenerationPanel } from './ImageGenerationPanel';
import { type WorkspaceContext } from '../../App';
// Remove other unused imports
// import { type AnimalProfile } from '../../types/AnimalProfile';
// import { ProfilePhotoGallery } from './ProfilePhotoGallery';
// import { PhotoUploader } from './PhotoUploader';

// Define input type for the delete handler prop (can be defined here or imported)
interface DeletePhotoInput {
  profileId: string;
  photoId: string;
  storagePath: string;
}

interface WorkspacePanelProps {
  context: WorkspaceContext;
  onPhotoSelectForGeneration: (profileId: string, photoId: string | null) => void;
  onDeletePhoto: (input: DeletePhotoInput) => Promise<boolean>; // Add delete handler prop
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ context, onPhotoSelectForGeneration, onDeletePhoto }) => {

  const renderWorkspaceContent = () => {
    if (!context) {
      return (
        <Card className="bg-gray-50 dark:bg-gray-800/50 h-full flex items-center justify-center">
          <p className="text-center text-gray-500 dark:text-gray-400 italic">
            Select an animal profile to view details, or select multiple profiles to start generating images.
          </p>
        </Card>
      );
     }

    switch (context.type) {
      case 'viewing_details':
        // Comment out the usage of the non-existent component
        return (
          <Card>
            <p>Details for Profile ID: {context.profileId} (Details component placeholder)</p>
            {/* <AnimalProfileDetails profileId={context.profileId} /> */}
          </Card>
        );

      case 'generation_setup': {
        const validSelections = context.selectedProfiles
          .map(profile => ({
            profileId: profile.id,
            photoId: context.selectedPhotoMap[profile.id] || null
          }))
          .filter(selection => selection.photoId !== null) as { profileId: string; photoId: string }[];

        return (
          <div className="space-y-6">
            <SelectedPhotosPanel
              selectedProfiles={context.selectedProfiles}
              selectedPhotoMap={context.selectedPhotoMap}
              onPhotoSelect={onPhotoSelectForGeneration}
              onDeletePhoto={onDeletePhoto}
            />
            <ImageGenerationPanel
              selections={validSelections}
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div>
      {renderWorkspaceContent()}
    </div>
  );
};
