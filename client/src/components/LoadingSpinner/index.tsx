// src/components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message, 
  fullPage = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-2 border-gray-900 dark:border-gray-100 border-t-transparent rounded-full animate-spin`} />
      {message && (
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};