import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  // Allow all other standard select attributes like value, onChange, id, className, aria-label, etc.
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  id,
  className,
  ...props
}) => {
  const baseClasses =
    'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm '
    + 'focus:outline-none focus:ring-sky-500 focus:border-sky-500 '
    + 'dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ';

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={twMerge(baseClasses, className)}
        {...props} // Spread the rest of the props (like value, onChange, disabled etc.)
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
