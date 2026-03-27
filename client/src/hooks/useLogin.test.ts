import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { useLogin } from './useLogin';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as unknown as typeof axios & {
  post: ReturnType<typeof vi.fn>;
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
  configurable: true
});

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
  });

  describe('handleChange', () => {
    it('should update form data', () => {
      const { result } = renderHook(() => useLogin());
      
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' }
        } as React.ChangeEvent<HTMLInputElement>);
      });
      
      expect(result.current.formData.email).toBe('test@example.com');
    });

    it('should clear field error when typing', () => {
      const { result } = renderHook(() => useLogin());
      
      // Set initial error
      act(() => {
        result.current.errors.email = 'Email required';
      });
      
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' }
        } as React.ChangeEvent<HTMLInputElement>);
      });
      
      expect(result.current.errors.email).toBe('');
    });

    it('should clear server error when typing', () => {
      const { result } = renderHook(() => useLogin());
      
      // Set initial server error
      act(() => {
        result.current.serverError = 'Server error';
      });
      
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' }
        } as React.ChangeEvent<HTMLInputElement>);
      });
      
      expect(result.current.serverError).toBeNull();
    });
  });

  describe('onSubmit', () => {
    it('should validate form and show errors when invalid', async () => {
      const { result } = renderHook(() => useLogin());
      
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      
      await act(async () => {
        await result.current.onSubmit(event);
      });
      
      expect(result.current.errors.email).toBe("L'email est requis");
      expect(result.current.errors.password).toBe("Le mot de passe est requis");
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should submit successfully and redirect', async () => {
      const mockResponse = { data: { token: 'fake-token' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      const { result } = renderHook(() => useLogin());
      
      // Set form data
      act(() => {
        result.current.formData.email = 'test@example.com';
        result.current.formData.password = 'password123';
      });
      
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      
      await act(async () => {
        await result.current.onSubmit(event);
      });
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        {
          email: 'test@example.com',
          password: 'password123',
        },
        expect.objectContaining({
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'fake-token');
      expect(window.location.href).toBe('/candidates');
    });

    it('should handle API error and show error message', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);
      
      const { result } = renderHook(() => useLogin());
      
      act(() => {
        result.current.formData.email = 'test@example.com';
        result.current.formData.password = 'wrongpassword';
      });
      
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      
      await act(async () => {
        await result.current.onSubmit(event);
      });
      
      expect(result.current.serverError).toBe('Invalid credentials');
    });

    it('should handle timeout error', async () => {
      const mockError = { code: 'ECONNABORTED' };
      mockedAxios.post.mockRejectedValueOnce(mockError);
      
      const { result } = renderHook(() => useLogin());
      
      act(() => {
        result.current.formData.email = 'test@example.com';
        result.current.formData.password = 'password123';
      });
      
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      
      await act(async () => {
        await result.current.onSubmit(event);
      });
      
      expect(result.current.serverError).toBe('Le serveur ne répond pas. Veuillez réessayer.');
    });

    it('should not submit if already loading', async () => {
      const { result } = renderHook(() => useLogin());
      
      act(() => {
        result.current.formData.email = 'test@example.com';
        result.current.formData.password = 'password123';
        result.current.isLoading = true;
      });
      
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      
      await act(async () => {
        await result.current.onSubmit(event);
      });
      
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});