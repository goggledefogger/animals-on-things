import React from 'react';
import { type AnimalProfile } from '../../types/AnimalProfile';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'; // Example icons

interface AnimalProfileCardProps {
  profile: AnimalProfile;
  isSelected: boolean;
  onSelectToggle: (profile: AnimalProfile) => void; // For selecting for generation
  onViewDetails: (profileId: string) => void; // For viewing details in workspace
  onDelete: (profileId: string) => void;
  // isDeleting?: boolean; // Optional: To show loading state on delete button
}

export const AnimalProfileCard: React.FC<AnimalProfileCardProps> = ({
  profile,
  isSelected,
  onSelectToggle,
  onViewDetails,
  onDelete,
  // isDeleting = false,
}) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection when clicking delete
    if (window.confirm(`Are you sure you want to delete profile "${profile.name}"? This cannot be undone.`)) {
      onDelete(profile.id);
    }
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection when clicking details button
    onViewDetails(profile.id);
  };

  const handleCardClick = () => {
    onSelectToggle(profile);
  };

  return (
    <Card
      className={`mb-3 cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-[1.02] hover:shadow-lg ${isSelected ? 'border-2 border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border dark:border-gray-700'}`}
      onClick={handleCardClick}
      padding="p-3" // Smaller padding for the card
    >
      <div className="flex justify-between items-center">
        {/* Profile Name - Make clickable for details? Or use dedicated button */}
        <h3
          className="text-md font-semibold font-nunito truncate text-gray-800 dark:text-gray-100"
          title={profile.name}
        >
          {profile.name}
        </h3>

        {/* Action Buttons */}
        <div className="flex space-x-1 flex-shrink-0">
          <Button
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={handleViewDetailsClick}
            title="View Details & Photos"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
            onClick={handleDeleteClick}
            title="Delete Profile"
            // disabled={isDeleting} // Add disabled state if needed
          >
            {/* {isDeleting ? <Spinner size="sm" /> : <TrashIcon className="h-4 w-4" />} */}
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Optionally add a small thumbnail preview later */}
      {/* <div className="mt-2 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">Thumb</div> */}
    </Card>
  );
};
