import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Add variant prop later if needed (e.g., primary, secondary, destructive)
  // variant?: 'primary' | 'secondary' | 'destructive';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  // Base styling
  const baseStyle = 
    'inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Primary variant styling (default for now)
  const primaryStyle = 
    'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:focus:ring-offset-gray-800';

  // Combine styles
  const combinedClassName = `${baseStyle} ${primaryStyle} ${className}`;

  return (
    <button
      type="button" // Default to type="button" unless overridden
      className={combinedClassName}
      {...props} // Spread the rest of the button props (like onClick, disabled, type='submit')
    >
      {children}
    </button>
  );
}; 