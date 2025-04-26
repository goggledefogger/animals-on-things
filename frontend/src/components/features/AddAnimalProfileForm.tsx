import React, { useState, FormEvent } from 'react';
import { useAnimalProfiles } from '../../hooks/useAnimalProfiles';

export const AddAnimalProfileForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const { addProfile } = useAnimalProfiles(); // Get the add function from the hook
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for the animal profile.');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await addProfile(name); // Call the add function from the hook
      setName(''); // Clear the input field on success
    } catch (err) {
      console.error("Failed to add profile:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t dark:border-gray-600">
      <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Add New Animal Profile:
      </label>
      <div className="flex space-x-2">
        <input
          id="profileName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sparky the Squirrel"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          disabled={isAdding}
          required
        />
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
          disabled={isAdding || !name.trim()}
        >
          {isAdding ? 'Adding...' : 'Add Profile'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}; 