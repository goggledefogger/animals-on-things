// import React from 'react'; // Remove unused import
import { Card } from '../common/Card';
import { AnimalProfileCard } from './AnimalProfileCard';
import { type AnimalProfile } from '../../types/AnimalProfile';
import { AddAnimalProfileForm } from './AddAnimalProfileForm';
// import { useState } from 'react'; // Remove unused import

interface AnimalProfilesPanelProps {
  profiles: AnimalProfile[];
  selectedProfiles: AnimalProfile[];
  onSelectProfileToggle: (profile: AnimalProfile) => void;
  onDelete: (profileId: string) => void;
  handleViewDetails: (profileId: string) => void;
  loading?: boolean;
  error?: string;
}

export default function AnimalProfilesPanel({
  profiles,
  selectedProfiles,
  onSelectProfileToggle,
  onDelete,
  handleViewDetails,
  loading,
  error,
}: AnimalProfilesPanelProps) {
  const handleDelete = (profileId: string) => {
    onDelete(profileId);
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500">Loading profiles...</p>;
    }
    if (error) {
      return <p className="text-red-500 text-xs mt-1">Error: {error}</p>;
    }

    return (
      <>
        {profiles.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No animal profiles created yet.</p>
        ) : (
          <div>
            {profiles.map((profile) => {
              const isSelected = selectedProfiles.some(p => p.id === profile.id);
              return (
                <AnimalProfileCard
                  key={profile.id}
                  profile={profile}
                  isSelected={isSelected}
                  onSelectToggle={onSelectProfileToggle}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
              );
            })}
          </div>
        )}
        <AddAnimalProfileForm />
      </>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-center text-gray-700 dark:text-gray-200 px-2 pt-1">Animal Profiles</h2>
      <div className="flex-grow overflow-y-auto px-2 pb-2">
        {renderContent()}
      </div>
    </Card>
  );
}
