import React from 'react';
import { useAnimalProfiles } from '../../hooks/useAnimalProfiles';
import { AddAnimalProfileForm } from './AddAnimalProfileForm';

export const AnimalProfileList: React.FC = () => {
  const { profiles, loading, error } = useAnimalProfiles();

  if (loading) {
    return <p className="text-center text-gray-500">Loading your animal profiles...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error loading profiles: {error.message}</p>;
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">Your Animal Profiles</h2>
      {profiles.length === 0 && !loading && (
        <p className="text-gray-500 dark:text-gray-400 mb-3">You haven't added any animal profiles yet.</p>
      )}
      {profiles.length > 0 && (
        <ul className="space-y-2 mb-4">
          {profiles.map((profile) => (
            <li key={profile.id} className="p-2 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <span className="font-medium text-gray-800 dark:text-gray-100">{profile.name}</span>
              {/* Add created date? */}
              {/* <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Created: {new Date(profile.createdAt).toLocaleDateString()}</span> */}
              {/* TODO: Add delete button here */}
            </li>
          ))}
        </ul>
      )}
      {/* Render the form component */}
      <AddAnimalProfileForm />
    </div>
  );
}; 