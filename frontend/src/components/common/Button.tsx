import React, { ButtonHTMLAttributes } from 'react';

// Define variants and sizes
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // Add loading state prop?
  // isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary', // Default variant
  size = 'md', // Default size
  // isLoading = false,
  ...props
}) => {
  // Base styling (common to all buttons)
  const baseStyle =
    'inline-flex items-center justify-center border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out';

  // Size specific styles
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',     // Adjusted padding
    md: 'px-4 py-2 text-sm',      // Default
    lg: 'px-5 py-2.5 text-base',  // Adjusted padding
  };

  // Variant specific styles
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'border-transparent text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 dark:focus:ring-offset-gray-800',
    secondary:
      'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-sky-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800',
    danger:
      'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:focus:ring-offset-gray-800',
    ghost: // Subtle, often for icon buttons or less important actions
      'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:ring-sky-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:focus:ring-offset-gray-800',
  };

  // Combine styles
  const combinedClassName = `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <button
      type="button" // Default to type="button"
      className={combinedClassName}
      {...props} // Spread the rest (like onClick, disabled)
    >
      {/* TODO: Add loading spinner display if isLoading */}
      {children}
    </button>
  );
};
