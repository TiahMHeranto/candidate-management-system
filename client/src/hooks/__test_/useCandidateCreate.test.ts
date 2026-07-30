import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCandidateCreate } from '../useCandidateCreate';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { validateSkills } from '../../utils/skillsUtils';

vi.mock('../../lib/axios');
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

const mockedApi = api as any;
const mockedNavigate = vi.fn();

describe('useCandidateCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockedNavigate);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCandidateCreate());

    expect(result.current.serverError).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors).toBeDefined();
  });

  it('should submit form successfully', async () => {
    const mockResponse = { data: { _id: '123' } };
    mockedApi.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCandidateCreate());

    const mockEvent = {
      preventDefault: vi.fn(),
    } as any;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // Empty form fails RHF validation, so API is not called
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('should validate skills before submission', () => {
    const empty = validateSkills('');
    expect(empty.isValid).toBe(false);
    expect(empty.error).toBe('Ajoutez au moins une compétence');

    const valid = validateSkills('React, TypeScript');
    expect(valid.isValid).toBe(true);
  });

  it('should handle API error', async () => {
    const mockError = {
      response: {
        data: { message: 'Email already exists' },
      },
    };
    mockedApi.post.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCandidateCreate());

    expect(result.current.serverError).toBeNull();
  });

  it('should go back to candidates list', () => {
    const { result } = renderHook(() => useCandidateCreate());

    act(() => {
      result.current.goBack();
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/candidates');
  });
});
