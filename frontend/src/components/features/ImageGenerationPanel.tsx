import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { useImageGeneration } from '../../hooks/useImageGeneration';

// Define the structure for a single selection passed from App.tsx
interface GenerationSelection {
  profileId: string;
  photoId: string;
}

interface ImageGenerationPanelProps {
  selections: GenerationSelection[]; // Changed from profileId/selectedPhotoId
}

// TODO: Define styles properly, maybe fetch from config?
const PREDEFINED_STYLES = [
  'Comic Book', 'Watercolor', 'Pixel Art', 'Jungle', 'Space', 'Cozy'
];

export const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({ selections }) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(PREDEFINED_STYLES[0]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const { generateImage, isGenerating, generatedImageUrl, generationError } = useImageGeneration();

  const canGenerate = selections.length > 0;

  const handleGenerateClick = () => {
    // Use the selected style if available, otherwise default to "custom" if needed.
    // The backend needs *some* style, even if we primarily use the prompt.
    const styleToSend = selectedStyle || "custom";
    const promptToSend = customPrompt.trim() || null; // Send null if empty

    // Check if we have selections and *either* a selected style OR a custom prompt.
    if (selections.length > 0 && (selectedStyle || promptToSend)) {
      generateImage({
          selections,
          style: styleToSend, // Send the selected style or "custom"
          prompt: promptToSend // Send the custom prompt if it exists
      });
    } else {
      // Handle the case where generation shouldn't be triggered (e.g., log or show message)
      console.warn("Generation not triggered: requires selections and either a style or prompt.");
    }
  };

  return (
    <Card className="mt-6 bg-gray-50 dark:bg-gray-800/50">
      <h4 className="text-lg font-semibold font-nunito mb-4 text-gray-800 dark:text-gray-200">Style & Generate</h4>

      {/* Style/Prompt Inputs (Disable when generating) */}
      <fieldset disabled={isGenerating} className="space-y-4">
        {/* Predefined Style Selector (using buttons for now) */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose a style (optional if using custom prompt):</p>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_STYLES.map(style => (
              <Button
                key={style}
                variant={selectedStyle === style ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setSelectedStyle(prev => prev === style ? null : style);
                }}
              >
                {style}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Input */}
        <div className="mb-4">
            <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Prompt (optional if using style):</label>
            <Textarea
              id="custom-prompt"
              placeholder="Or describe your own style/scene..."
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
              }}
              rows={3}
              aria-label="Custom generation prompt"
            />
        </div>
      </fieldset>

      {/* Generate Button */}
      <div className="mt-5 text-right">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerateClick}
          disabled={isGenerating || !canGenerate || (!selectedStyle && !customPrompt.trim())}
          title={!canGenerate ? "Select a photo first" : (!selectedStyle && !customPrompt.trim() ? "Choose a style or enter a prompt" : undefined)}
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </Button>
      </div>

      {/* Error Display */}
      {generationError && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-3 text-center">Error: {generationError}</p>
      )}

      {/* Result Display */}
      {(isGenerating || generatedImageUrl) && (
        <div className="mt-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md text-center min-h-[100px] flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          {isGenerating ? (
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Generating image...</p>
          ) : generatedImageUrl ? (
            <img src={generatedImageUrl} alt="Generated image" className="max-w-full max-h-80 mx-auto rounded shadow-md" />
          ) : null /* Should not happen if outer condition is met */}
        </div>
      )}

      {/* TODO: Add Download Button (only if generatedImageUrl exists) */}

    </Card>
  );
};
