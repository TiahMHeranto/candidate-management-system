// src/components/CandidateCardSkeleton.tsx
export const CandidateCardSkeleton = () => {
  return (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary
                    border border-light-border dark:border-dark-border
                    rounded-lg p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </div>
    </div>
  );
};