import React from 'react';
import { Card } from '../common/Card';
import { SelectedPhotosPanel } from './SelectedPhotosPanel';
import { ImageGenerationPanel } from './ImageGenerationPanel';
import { type WorkspaceContext } from '../../App';

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

  // If no context (no profiles selected), show placeholder
  if (!context) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-800/50 h-full flex items-center justify-center">
        <p className="text-center text-gray-500 dark:text-gray-400 italic">
          Select an animal profile from the left to begin generating images.
        </p>
      </Card>
    );
  }

  // If context exists, it must be 'generation_setup'
  // Directly render the generation setup UI
  const { selectedProfiles, selectedPhotoMap } = context;

  const validSelections = selectedProfiles
    .map(profile => ({
      profileId: profile.id,
      photoId: selectedPhotoMap[profile.id] || null
    }))
    .filter(selection => selection.photoId !== null) as { profileId: string; photoId: string }[];

  return (
    <div className="space-y-6">
      <SelectedPhotosPanel
        selectedProfiles={selectedProfiles}
        selectedPhotoMap={selectedPhotoMap}
        onPhotoSelect={onPhotoSelectForGeneration}
        onDeletePhoto={onDeletePhoto}
      />
      <ImageGenerationPanel
        selections={validSelections}
      />
    </div>
  );
};
