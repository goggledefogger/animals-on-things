import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
  { value: 'comic', label: 'Comic Book' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'painting', label: 'Painting' },
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'fantasy', label: 'Fantasy Art' },
];

export const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({ selections }) => {
  const [selectedStyle, setSelectedStyle] = useState<string>(PREDEFINED_STYLES[0]?.value || '');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Can generate if there's at least one valid selection and not already generating
  const canGenerate = selections.length > 0 && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);

    console.log('Starting generation with selections:', selections);
    console.log('Style:', selectedStyle, 'Prompt:', customPrompt);

    try {
      const functions = getFunctions();
      const generateImageFunction = httpsCallable(functions, 'generateImage'); 
      
      // Pass the array of selections along with style and prompt
      const result = await generateImageFunction({ 
        selections: selections, // Array of { profileId, photoId }
        style: selectedStyle,
        prompt: customPrompt,
      });

      const data = result.data as { imageUrl?: string; error?: string }; // Type assertion

      if (data.error) {
        throw new Error(data.error);
      }
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        console.log('Generated image URL:', data.imageUrl);
      } else {
        throw new Error('Function did not return an image URL or an error.');
      }

    } catch (error) {
      console.error("Image generation failed:", error);
      setGenerationError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to display the list of selected items
  const renderSelectionSummary = () => {
    if (selections.length === 0) return null;
    return (
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
        <p>Generating image based on:</p>
        <ul className="list-disc list-inside ml-2">
          {selections.map(sel => (
            <li key={sel.profileId}>Profile {sel.profileId.substring(0, 6)}... / Photo {sel.photoId.substring(0, 6)}...</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Card className="w-full mb-4">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
        Generate New Image
      </h3>

      {selections.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Please select one or more animal profiles and a photo for each.</p>
      ) : (
        <div className="space-y-3">
          {renderSelectionSummary()}

          {/* Style Selector */}
          <div>
            <label htmlFor="style-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Style:</label>
            <select 
              id="style-select"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isGenerating}
            >
              {PREDEFINED_STYLES.map(style => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
          </div>

          {/* Custom Prompt */}
          <div>
            <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Prompt (Optional):</label>
            <Input
              id="custom-prompt"
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., wearing party hats, sitting on the moon"
              className="mt-1 block w-full"
              disabled={isGenerating}
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-center sm:justify-end">
            <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full sm:w-auto">
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
          </div>

          {/* Error Display */}
          {generationError && (
            <p className="text-sm text-red-600 dark:text-red-400">Error: {generationError}</p>
          )}

          {/* Result Display */}
          <div className="mt-3 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center min-h-[80px] sm:min-h-[100px] flex items-center justify-center">
            {isGenerating ? (
              <p className="text-gray-500 dark:text-gray-400">Generating image...</p>
            ) : generatedImageUrl ? (
              <img src={generatedImageUrl} alt="Generated image" className="max-w-full max-h-64 sm:max-h-80 mx-auto rounded" />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Generated image will appear here.</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}; 