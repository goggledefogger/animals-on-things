import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; // Optional label
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, className = '', ...props }) => {
  const textareaId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  const baseStyle =
    'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm';
  const bgStyle = 'bg-white dark:bg-gray-700';
  const textStyle = 'text-gray-900 dark:text-gray-100';

  return (
    <div className={`w-full ${label ? 'mb-1' : ''}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`${baseStyle} ${bgStyle} ${textStyle} ${className}`}
        {...props}
      />
    </div>
  );
};
