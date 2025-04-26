import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface ImageGenerationPanelProps {
  profileId: string | null;
  selectedPhotoId: string | null;
}

// TODO: Define styles properly, maybe fetch from config?
const PREDEFINED_STYLES = [
  { value: 'comic', label: 'Comic Book' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'painting', label: 'Painting' },
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'fantasy', label: 'Fantasy Art' },
];

export const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({ profileId, selectedPhotoId }) => {
  const [selectedStyle, setSelectedStyle] = useState<string>(PREDEFINED_STYLES[0]?.value || '');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const canGenerate = profileId && selectedPhotoId && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate || !selectedPhotoId || !profileId) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);

    console.log('Starting generation with:', { 
        profileId, 
        photoId: selectedPhotoId, 
        style: selectedStyle, 
        prompt: customPrompt 
    });

    try {
      const functions = getFunctions();
      // IMPORTANT: Ensure the function name matches exactly what's deployed
      const generateImageFunction = httpsCallable(functions, 'generateImage'); 
      
      const result = await generateImageFunction({ 
        photoId: selectedPhotoId, 
        profileId: profileId, // Pass profileId too if function needs it for pathing/validation
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

  return (
    <Card className="w-full max-w-3xl mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
        Generate New Image
      </h3>

      {!profileId ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Please select an animal profile first.</p>
      ) : !selectedPhotoId ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Please select a photo from the gallery above to generate an image.</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Generating image based on photo: <span className="font-medium text-indigo-600 dark:text-indigo-400">{selectedPhotoId}</span></p>

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
              placeholder="e.g., wearing a party hat, sitting on the moon"
              className="mt-1 block w-full"
              disabled={isGenerating}
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={!canGenerate}>
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
          </div>

          {/* Error Display */}
          {generationError && (
            <p className="text-sm text-red-600 dark:text-red-400">Error: {generationError}</p>
          )}

          {/* Result Display */}
          <div className="mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center min-h-[100px] flex items-center justify-center">
            {isGenerating ? (
              <p className="text-gray-500 dark:text-gray-400">Generating image...</p>
            ) : generatedImageUrl ? (
              <img src={generatedImageUrl} alt="Generated image" className="max-w-full max-h-80 mx-auto rounded" />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Generated image will appear here.</p>
            )}
          </div>
          {/* TODO: Add Download button for generated image */}
        </div>
      )}
    </Card>
  );
}; 