import { type Candidate } from '../types';

interface Filters {
  name: string;
  status: string;
  position: string;
}

export const filterCandidates = (candidates: Candidate[], filters: Filters): Candidate[] => {
  let result = [...candidates];
  
  if (filters.name && filters.name.trim()) {
    const searchTerm = filters.name.toLowerCase().trim();
    result = result.filter(candidate => 
      candidate.name?.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.status && filters.status.trim()) {
    result = result.filter(candidate => 
      candidate.status === filters.status
    );
  }
  
  if (filters.position && filters.position.trim()) {
    const searchTerm = filters.position.toLowerCase().trim();
    result = result.filter(candidate => 
      candidate.position?.toLowerCase().includes(searchTerm)
    );
  }
  
  return result;
};

export const getActiveFilterCount = (filters: Filters): number => {
  return Object.values(filters).filter(value => value && value.trim() !== '').length;
};