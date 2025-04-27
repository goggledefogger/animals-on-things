import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';

// Define the structure for a single selection passed from App.tsx
interface GenerationSelection {
  profileId: string;
  photoId: string;
}

interface ImageGenerationPanelProps {
  selections: GenerationSelection[]; // Changed from profileId/selectedPhotoId
  onGenerate: (style: string | null, prompt: string | null) => void;
}

// TODO: Define styles properly, maybe fetch from config?
const PREDEFINED_STYLES = [
  'Comic Book', 'Watercolor', 'Pixel Art', 'Jungle', 'Space', 'Cozy'
];

export const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({ selections, onGenerate }) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(PREDEFINED_STYLES[0]);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Determine if generation is possible (at least one valid selection)
  const canGenerate = selections.length > 0;

  const handleGenerateClick = () => {
    // Prioritize custom prompt if entered, otherwise use selected style
    const styleToSend = customPrompt.trim() ? null : selectedStyle;
    const promptToSend = customPrompt.trim() ? customPrompt.trim() : null;
    // Check if either style or prompt is selected before calling onGenerate
    if (styleToSend || promptToSend) {
        onGenerate(styleToSend, promptToSend);
    }
  };

  return (
    <Card className="mt-6 bg-gray-50 dark:bg-gray-800/50">
      <h4 className="text-lg font-semibold font-nunito mb-4 text-gray-800 dark:text-gray-200">Style & Generate</h4>

      {/* Predefined Style Selector (using buttons for now) */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose a style:</p>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_STYLES.map(style => (
            <Button
              key={style}
              variant={selectedStyle === style ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setSelectedStyle(style);
                setCustomPrompt('');
              }}
            >
              {style}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Input - Simplified */}
      <div className="mb-4">
          <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Prompt:</label>
          <Textarea
            id="custom-prompt"
            placeholder="Or describe your own style/scene..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
            aria-label="Custom generation prompt"
          />
      </div>

      {/* Generate Button */}
      <div className="mt-5 text-right">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerateClick}
          disabled={!canGenerate || (!selectedStyle && !customPrompt.trim())} // Disabled if no selections OR no style/prompt
          title={!canGenerate ? "Select a photo for at least one profile first" : (!selectedStyle && !customPrompt.trim() ? "Choose a style or enter a prompt" : undefined)}
        >
          Generate Image
        </Button>
      </div>

      {/* Error Display */}
      {/* generationError && (
        <p className="text-sm text-red-600 dark:text-red-400">Error: {generationError}</p>
      )} */}

      {/* Result Display */}
      <div className="mt-3 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center min-h-[80px] sm:min-h-[100px] flex items-center justify-center">
        {/* isGenerating ? (
          <p className="text-gray-500 dark:text-gray-400">Generating image...</p>
        ) : generatedImageUrl ? (
          <img src={generatedImageUrl} alt="Generated image" className="max-w-full max-h-64 sm:max-h-80 mx-auto rounded" />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Generated image will appear here.</p>
        ) */}
      </div>

      {/* TODO: Add Download Button */}

    </Card>
  );
};
