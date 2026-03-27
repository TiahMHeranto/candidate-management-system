// src/components/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-light-border dark:border-dark-border
                   hover:bg-gray-100 dark:hover:bg-gray-800
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      {getPageNumbers().map((page, index) => (
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md transition-colors duration-200
                       ${currentPage === page
                         ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                         : 'border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-800'
                       }`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-light-border dark:border-dark-border
                   hover:bg-gray-100 dark:hover:bg-gray-800
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};