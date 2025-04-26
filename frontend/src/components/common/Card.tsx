import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string; // Allow additional custom classes
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}; 