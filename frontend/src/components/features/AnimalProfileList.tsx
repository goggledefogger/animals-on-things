import React, { useState } from 'react';
import { useAnimalProfiles } from '../../hooks/useAnimalProfiles';
import { AddAnimalProfileForm } from './AddAnimalProfileForm';
import { Card } from '../common/Card';
import { AnimalProfile } from '../../types/AnimalProfile';

interface AnimalProfileListProps {
  selectedProfiles: AnimalProfile[];
  onSelectProfile: (profile: AnimalProfile) => void;
}

export const AnimalProfileList: React.FC<AnimalProfileListProps> = ({ selectedProfiles, onSelectProfile }) => {
  const { profiles, loading, error, deleteProfile } = useAnimalProfiles();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (profileId: string, profileName: string) => {
    if (selectedProfiles.some(p => p.id === profileId)) {
      const profileToDeselect = selectedProfiles.find(p => p.id === profileId);
      if (profileToDeselect) {
        onSelectProfile(profileToDeselect);
      }
    }
    if (window.confirm(`Are you sure you want to delete the profile "${profileName}"? Associated photos will eventually be removed too (TODO).`)) {
      setDeletingId(profileId);
      try {
        await deleteProfile(profileId);
      } catch (err) {
        console.error("Failed to delete profile:", err);
        alert(err instanceof Error ? err.message : 'Failed to delete profile');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500 dark:text-gray-400">Loading your animal profiles...</p>;
    }
  
    if (error) {
      return <p className="text-center text-red-500">Error loading profiles: {error.message}</p>;
    }

    return (
      <>
        {profiles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 mb-3 text-center">You haven't added any animal profiles yet.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {profiles.map((profile) => {
              const isSelected = selectedProfiles.some(p => p.id === profile.id);
              const isDeleting = profile.id === deletingId;
              return (
                <li 
                  key={profile.id} 
                  className={`relative flex flex-row justify-between items-center p-2 sm:p-3 border rounded-md shadow-sm transition-all duration-150 cursor-pointer 
                    ${isDeleting ? 'opacity-50' : 'hover:shadow-md'} 
                    ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-600' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600'}`}
                  onClick={() => !isDeleting && onSelectProfile(profile)}
                >
                  <span 
                    className={`font-medium text-gray-800 dark:text-gray-100 truncate flex-1 ${isSelected ? 'text-indigo-800 dark:text-indigo-200' : ''}`}
                    title={profile.name}
                  >
                    {profile.name}
                  </span>
                  <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(profile.id, profile.name); }}
                      disabled={isDeleting}
                      className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 
                        ${isDeleting ? 'cursor-not-allowed' : 'hover:bg-red-50 dark:hover:bg-red-900/30'} 
                        text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-500`}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </li>
              );
            })}
          </ul>
        )}
        <AddAnimalProfileForm />
      </>
    );
  }

  return (
    <Card className="w-full mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-center text-gray-700 dark:text-gray-200">Your Animal Profiles</h2>
      {renderContent()}
    </Card>
  );
}; 