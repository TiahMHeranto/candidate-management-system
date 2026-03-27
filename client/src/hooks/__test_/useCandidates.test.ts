import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCandidates } from '../useCandidates';
import api from '../../lib/axios';
import { announceToScreenReader } from '../../utils/announcer';

// Mocks
vi.mock('../../lib/axios');
vi.mock('../../utils/announcer');

const mockedApi = api as any;
const mockedAnnounce = announceToScreenReader as any;

const mockCandidates = [
  { _id: '1', name: 'Jean Dupont', status: 'pending' },
  { _id: '2', name: 'Marie Martin', status: 'validated' },
];

describe('useCandidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch candidates on mount', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { candidates: mockCandidates } });
    
    const { result } = renderHook(() => useCandidates());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(mockedApi.get).toHaveBeenCalledWith('/api/candidates', {
      params: { limit: 1000, page: 1 }
    });
    expect(result.current.allCandidates).toEqual(mockCandidates);
    expect(mockedAnnounce).toHaveBeenCalledWith(`${mockCandidates.length} candidats chargés avec succès`);
  });

  it('should handle fetch error', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useCandidates());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Impossible de charger les candidats. Veuillez réessayer.');
    expect(mockedAnnounce).toHaveBeenCalledWith('Erreur lors du chargement des candidats');
  });

  it('should refresh candidates', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { candidates: mockCandidates } });
    
    const { result } = renderHook(() => useCandidates());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    mockedApi.get.mockResolvedValueOnce({ data: { candidates: [mockCandidates[0]] } });
    
    await act(async () => {
      await result.current.handleRefresh();
    });
    
    expect(result.current.refreshing).toBe(false);
    expect(mockedApi.get).toHaveBeenCalledTimes(2);
  });

  it('should delete candidate', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { candidates: mockCandidates } });
    
    const { result } = renderHook(() => useCandidates());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.handleDeleteCandidate('1');
    });
    
    expect(result.current.allCandidates).toHaveLength(1);
    expect(result.current.allCandidates[0]._id).toBe('2');
    expect(mockedAnnounce).toHaveBeenCalledWith('Candidat supprimé avec succès');
  });

  it('should set error to null when setError called', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useCandidates());
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    
    act(() => {
      result.current.setError(null);
    });
    
    expect(result.current.error).toBeNull();
  });
});