import React, { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> { // Extend standard div attributes
  children: ReactNode;
  className?: string; // Allow additional custom classes
  padding?: string; // Optional custom padding class
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'p-5 md:p-6', // Default padding
  ...props // Spread remaining props (like onClick)
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${padding} ${className}`}
      {...props} // Apply onClick and other div attributes here
    >
      {children}
    </div>
  );
};
