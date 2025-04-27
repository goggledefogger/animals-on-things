import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAnimalProfiles } from '../../hooks/useAnimalProfiles';
import { AnimalProfileCard } from './AnimalProfileCard';
import { type AnimalProfile } from '../../types/AnimalProfile';

interface AnimalProfilesPanelProps {
  selectedProfiles: AnimalProfile[];
  onSelectProfileToggle: (profile: AnimalProfile) => void;
  onViewProfileDetails: (profileId: string) => void;
}

export const AnimalProfilesPanel: React.FC<AnimalProfilesPanelProps> = ({
  selectedProfiles,
  onSelectProfileToggle,
  onViewProfileDetails,
}) => {
  const { profiles, loading, error, addProfile, deleteProfile } = useAnimalProfiles();
  const [newProfileName, setNewProfileName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) return;
    setIsAdding(true);
    const newId = await addProfile(newProfileName);
    if (newId) {
      setNewProfileName('');
    }
    setIsAdding(false);
  };

  const handleDeleteProfile = async (profileId: string) => {
    await deleteProfile(profileId);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold font-nunito text-sky-800 dark:text-sky-300">Animal Profiles</h2>
        </div>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="New profile name..."
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            className="flex-grow"
            aria-label="New animal profile name"
            onKeyDown={(e) => e.key === 'Enter' && handleAddProfile()}
          />
          <Button
            onClick={handleAddProfile}
            disabled={isAdding || !newProfileName.trim()}
            className="px-3 py-1 text-sm flex-shrink-0"
          >
            {isAdding ? 'Adding...' : '+ Add New'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">Error: {error}</p>}
      </div>

      <div className="flex-grow pr-1 pb-2">
        {loading && <p className="text-center text-gray-500">Loading profiles...</p>}
        {!loading && profiles.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No animal profiles created yet.</p>
        )}
        {!loading && profiles.length > 0 && (
          <div>
            {profiles.map((profile) => (
              <AnimalProfileCard
                key={profile.id}
                profile={profile}
                isSelected={selectedProfiles.some(p => p.id === profile.id)}
                onSelectToggle={onSelectProfileToggle}
                onViewDetails={onViewProfileDetails}
                onDelete={handleDeleteProfile}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
