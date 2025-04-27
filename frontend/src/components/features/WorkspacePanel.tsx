import React from 'react';
import { Card } from '../common/Card';
// Import the context type from App
import { type WorkspaceContext } from '../../App';
import { type AnimalProfile } from '../../types/AnimalProfile'; // Need this type
// Import the new gallery component
import { ProfilePhotoGallery } from './ProfilePhotoGallery';
// Import the uploader
import { PhotoUploader } from './PhotoUploader';

interface WorkspacePanelProps {
  context: WorkspaceContext; // Use the imported type
  // Add other props as needed, e.g., profileId for detail view
}

// Placeholder for the generation controls section
const GenerationControlsPlaceholder: React.FC = () => (
  <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
    Image Generation Panel Placeholder (Style, Prompt, Generate Button)
  </div>
);

// Placeholder for the photo selection part within generation setup
const MiniPhotoSelectorPlaceholder: React.FC<{ profileName: string }> = ({ profileName }) => (
  <div className="mt-2 p-3 border border-dashed border-gray-300 rounded-md text-center text-gray-500 text-sm">
    Photo Selector for {profileName} Placeholder
  </div>
);


export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ context }) => {

  const renderContent = () => {
    if (!context) {
      return (
        <div className="border border-dashed border-gray-300 rounded-md p-10 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
          <p>Select an animal profile card (click the main body) to start generating, or click the pencil icon on a card to view its details and add photos.</p>
        </div>
      );
    }

    switch (context.type) {
      case 'viewing_details':
        return (
          <div>
            <h3 className="text-lg font-semibold font-nunito mb-4 text-blue-700 dark:text-blue-300">Profile Details</h3>
            <PhotoUploader profileId={context.profileId} />

            <h4 className="text-md font-semibold mb-2 mt-6 text-gray-700 dark:text-gray-300">Photos</h4>
            <ProfilePhotoGallery profileId={context.profileId} />
          </div>
        );

      case 'generation_setup':
        return (
          <div>
            <h3 className="text-lg font-semibold font-nunito mb-4 text-green-700 dark:text-green-300">Generation Setup</h3>

            {/* Section for selecting photos for each profile */}
            <div className="space-y-4 mb-6">
              {context.selectedProfiles.map((profile: AnimalProfile) => (
                <div key={profile.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                  <p className="font-medium text-gray-800 dark:text-gray-100">{profile.name}</p>
                  {/* Placeholder for photo selection for this profile */}
                  <MiniPhotoSelectorPlaceholder profileName={profile.name} />
                </div>
              ))}
            </div>

            {/* Placeholder for Generation Controls (Style, Prompt, Generate Button) */}
            <GenerationControlsPlaceholder />

            {/* TODO: Add Result Display Area */}
          </div>
        );

      default:
        // Should not happen with defined types, but good practice
        return <p className="text-red-500">Error: Unknown workspace context.</p>;
    }
  };

  return (
    <Card className="h-full"> {/* Basic card styling */}
      <h2 className="text-xl font-semibold font-nunito mb-4 text-sky-800 dark:text-sky-300">Workspace</h2>
      {renderContent()}
    </Card>
  );
};
