import { useEffect } from 'react';

export const useEscapeKey = (callback: () => void, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [callback, isActive]);
};