import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../useFilters';
import { announceToScreenReader } from '../../utils/announcer';

vi.mock('../../utils/announcer');

const mockCandidates = [
  { _id: '1', name: 'Jean Dupont', status: 'pending', position: 'Frontend' },
  { _id: '2', name: 'Marie Martin', status: 'validated', position: 'Backend' },
  { _id: '3', name: 'Pierre Durand', status: 'pending', position: 'Frontend' },
] as any;

describe('useFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty filters', () => {
    const { result } = renderHook(() => useFilters(mockCandidates));
    
    expect(result.current.filters).toEqual({ name: '', status: '', position: '' });
    expect(result.current.showFilters).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('should return all candidates when no filters', () => {
    const { result } = renderHook(() => useFilters(mockCandidates));
    
    expect(result.current.filteredCandidates).toHaveLength(3);
  });

  it('should filter by name', () => {
    const { result } = renderHook(() => useFilters(mockCandidates));
    
    act(() => {
      result.current.handleFilterChange('name', 'Jean');
    });
    
    expect(result.current.filters.name).toBe('Jean');
    expect(result.current.filteredCandidates).toHaveLength(1);
    expect(result.current.activeFilterCount).toBe(1);
    expect(announceToScreenReader).toHaveBeenCalledWith('Filtre name appliqué: Jean');
  });

  it('should filter by status', () => {
    const { result } = renderHook(() => useFilters(mockCandidates));
    
    act(() => {
      result.current.handleFilterChange('status', 'validated');
    });
    
    expect(result.current.filteredCandidates).toHaveLength(1);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should filter by position', () => {
    const { result } = renderHook(() => useFilters(mockCandidates));
    
    act(() => {
      result.current.handleFilterChange('position', 'Frontend');
    });
    
    expect(result.current.filteredCandidates).toHaveLength(2);
  });

  it('should reset filters', () => {
    const { result } = renderHook(() => useFilters(mockCandidates));
    
    act(() => {
      result.current.handleFilterChange('name', 'Jean');
      result.current.handleFilterChange('status', 'pending');
    });
    
    expect(result.current.activeFilterCount).toBe(2);
    
    act(() => {
      result.current.resetFilters();
    });
    
    expect(result.current.filters).toEqual({ name: '', status: '', position: '' });
    expect(result.current.filteredCandidates).toHaveLength(3);
    expect(result.current.activeFilterCount).toBe(0);
    expect(announceToScreenReader).toHaveBeenCalledWith('Tous les filtres ont été réinitialisés');
  });

  it('should toggle filters', () => {
    const { result } = renderHook(() => useFilters(mockCandidates));
    
    expect(result.current.showFilters).toBe(false);
    
    act(() => {
      result.current.toggleFilters();
    });
    
    expect(result.current.showFilters).toBe(true);
    
    act(() => {
      result.current.toggleFilters();
    });
    
    expect(result.current.showFilters).toBe(false);
  });

  it('should open and close filters', () => {
    const { result } = renderHook(() => useFilters(mockCandidates));
    
    act(() => {
      result.current.openFilters();
    });
    
    expect(result.current.showFilters).toBe(true);
    
    act(() => {
      result.current.closeFilters();
    });
    
    expect(result.current.showFilters).toBe(false);
  });
});