import React, { useState, FormEvent } from 'react';
import { useAnimalProfiles } from '../../hooks/useAnimalProfiles';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const AddAnimalProfileForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const { addProfile } = useAnimalProfiles();
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
      await addProfile(name);
      setName('');
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
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <Input
          id="profileName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sparky the Squirrel"
          disabled={isAdding}
          required
          className="flex-grow"
        />
        <Button
          type="submit"
          disabled={isAdding || !name.trim()}
          className="sm:w-auto"
        >
          {isAdding ? 'Adding...' : 'Add Profile'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}; 