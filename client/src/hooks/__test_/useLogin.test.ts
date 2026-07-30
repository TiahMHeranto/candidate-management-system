import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogin } from '../useLogin';
import api from '../../lib/axios';

vi.mock('../../lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('../useOffline', () => ({
  getIsOffline: vi.fn(() => false),
}));

const mockedApi = api as unknown as { post: ReturnType<typeof vi.fn> };

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.location.href = 'http://localhost:5173/login';
  });

  describe('handleChange', () => {
    it('should update form data', () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.email).toBe('test@example.com');
    });

    it('should clear field error when typing', async () => {
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.onSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.errors.email).toBe("L'email est requis");

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.errors.email).toBe('');
    });

    it('should clear server error when typing', async () => {
      mockedApi.post.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Invalid credentials' } },
      });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleChange({
          target: { name: 'password', value: 'password123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.serverError).toBe('Invalid credentials');

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'other@example.com' },
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
      expect(result.current.errors.password).toBe('Le mot de passe est requis');
      expect(mockedApi.post).not.toHaveBeenCalled();
    });

    it('should submit successfully and redirect', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: { token: 'fake-token' } });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleChange({
          target: { name: 'password', value: 'password123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(localStorage.getItem('authToken')).toBe('fake-token');
      expect(window.location.href).toContain('/');
    });

    it('should handle API error and show error message', async () => {
      mockedApi.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleChange({
          target: { name: 'password', value: 'wrongpassword' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.serverError).toBe('Invalid credentials');
    });

    it('should handle timeout error', async () => {
      mockedApi.post.mockRejectedValueOnce({ code: 'ECONNABORTED' });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleChange({
          target: { name: 'password', value: 'password123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.serverError).toBe(
        'Le serveur ne répond pas. Veuillez réessayer.'
      );
    });

    it('should not submit if already loading', async () => {
      let resolvePost: (value: unknown) => void = () => {};
      mockedApi.post.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePost = resolve;
          })
      );

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleChange({
          target: { name: 'password', value: 'password123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      let firstSubmit: Promise<void>;
      act(() => {
        firstSubmit = result.current.onSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      await act(async () => {
        await result.current.onSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(mockedApi.post).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolvePost({ data: { token: 'fake-token' } });
        await firstSubmit!;
      });
    });
  });
});
