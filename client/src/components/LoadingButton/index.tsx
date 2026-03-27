// src/components/LoadingButton.tsx
import React from 'react';
import { LoadingSpinner } from '../LoadingSpinner';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  icon?: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  loadingText,
  variant = 'primary',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-gray-900 dark:bg-gray-100 text-gray-50 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white',
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`px-4 py-2 rounded-md font-medium transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center justify-center gap-2
                 ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};