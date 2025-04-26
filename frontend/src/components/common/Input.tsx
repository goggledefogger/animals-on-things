import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // No variants needed for now
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  // Base styling
  const baseStyle =
    'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';

  // Dark mode styling
  const darkStyle =
    'dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400';

  // Disabled state styling
  const disabledStyle = 'disabled:opacity-50 disabled:cursor-not-allowed';

  // Combine styles
  const combinedClassName = `${baseStyle} ${darkStyle} ${disabledStyle} ${className}`;

  return (
    <input
      className={combinedClassName}
      {...props} // Spread the rest of the input props (like value, onChange, placeholder, required, disabled, etc.)
    />
  );
}; 