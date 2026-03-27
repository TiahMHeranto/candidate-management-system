import { useState, useMemo } from 'react';
import { filterCandidates, getActiveFilterCount } from '../utils/filterUtils';
import { type Candidate } from '../types';
import { announceToScreenReader } from '../utils/announcer';

interface Filters {
  name: string;
  status: string;
  position: string;
}

export const useFilters = (allCandidates: Candidate[]) => {
  const [filters, setFilters] = useState<Filters>({
    name: '',
    status: '',
    position: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredCandidates = useMemo(() => {
    return filterCandidates(allCandidates, filters);
  }, [allCandidates, filters]);

  const activeFilterCount = getActiveFilterCount(filters);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    if (value) {
      announceToScreenReader(`Filtre ${key} appliqué: ${value}`);
    }
  };

  const resetFilters = () => {
    setFilters({ name: '', status: '', position: '' });
    announceToScreenReader('Tous les filtres ont été réinitialisés');
  };

  const closeFilters = () => {
    setShowFilters(false);
  };

  const openFilters = () => {
    setShowFilters(true);
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  return {
    filters,
    showFilters,
    filteredCandidates,
    activeFilterCount,
    handleFilterChange,
    resetFilters,
    closeFilters,
    openFilters,
    toggleFilters,
  };
};