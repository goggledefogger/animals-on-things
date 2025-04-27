import React from 'react';
import { Card } from '../common/Card';
// Import the context type from App
import { type WorkspaceContext } from '../../App';
import { type AnimalProfile } from '../../types/AnimalProfile'; // Need this type
// Import the new gallery component
import { ProfilePhotoGallery } from './ProfilePhotoGallery';
// Import the uploader
import { PhotoUploader } from './PhotoUploader';
// Import the new panel
import { ImageGenerationPanel } from './ImageGenerationPanel';

interface WorkspacePanelProps {
  context: WorkspaceContext; // Use the imported type
  // Add the handler prop from App
  onPhotoSelectForGeneration?: (profileId: string, photoId: string | null) => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  context,
  onPhotoSelectForGeneration // Destructure the handler
}) => {

  // Placeholder handler for triggering generation
  const handleGenerate = (style: string | null, prompt: string | null) => {
      console.log("Triggering generation with:", {
          style,
          prompt,
          // Selections would be derived again here or passed up/accessed differently
          // For now, just log the style/prompt
      });
      // TODO: Implement actual call to backend function
      alert(`Generation triggered!\nStyle: ${style}\nPrompt: ${prompt}`);
  };

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

      case 'generation_setup': {
        if (!context.selectedProfiles || !context.selectedPhotoMap) {
          return <p className="text-red-500">Error: Invalid context for generation setup.</p>;
        }

        const generationSelections = context.selectedProfiles
          .map(profile => ({
            profileId: profile.id,
            photoId: context.selectedPhotoMap[profile.id] || null,
          }))
          .filter(selection => selection.photoId !== null) as { profileId: string; photoId: string }[];

        return (
          <div>
            <h3 className="text-lg font-semibold font-nunito mb-4 text-green-700 dark:text-green-300">Generation Setup</h3>
            {/* Photo Selection Section */}
            <div className="space-y-4 mb-6">
              {context.selectedProfiles.map((profile: AnimalProfile) => (
                <div key={profile.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                  <p className="font-medium text-gray-800 dark:text-gray-100">{profile.name}</p>
                  <ProfilePhotoGallery
                    profileId={profile.id}
                    selectedPhotoId={context.selectedPhotoMap[profile.id] ?? null}
                    onPhotoSelect={(photoId: string | null) => {
                      if (onPhotoSelectForGeneration) {
                        onPhotoSelectForGeneration(profile.id, photoId);
                      }
                    }}
                    isSelectable={true}
                  />
                </div>
              ))}
            </div>
            {/* Generation Panel */}
            <ImageGenerationPanel
              selections={generationSelections} // Pass the derived selections
              onGenerate={handleGenerate} // Pass the handler
            />
          </div>
        );
      }

      default: {
        return <p className="text-red-500">Error: Unknown workspace context.</p>;
      }
    }
  };

  return (
    <Card className="h-full"> {/* Basic card styling */}
      <h2 className="text-xl font-semibold font-nunito mb-4 text-sky-800 dark:text-sky-300">Workspace</h2>
      {renderContent()}
    </Card>
  );
};
