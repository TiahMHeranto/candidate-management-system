import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../axios';

describe('Axios instance', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add Authorization header if token exists', async () => {
    localStorage.setItem('authToken', 'test-token');

    const requestInterceptor = (api.interceptors.request as any).handlers[0];

    const config = await requestInterceptor.fulfilled({
      headers: {},
    });

    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('should not add Authorization header if no token', async () => {
    const requestInterceptor = (api.interceptors.request as any).handlers[0];

    const config = await requestInterceptor.fulfilled({
      headers: {},
    });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('should handle 401 response', async () => {
    const responseInterceptor = (api.interceptors.response as any).handlers[0];

    const mockError = {
      response: { status: 401 },
      config: {},
    };

    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    const hrefSetter = vi.fn();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        get href() {
          return 'http://localhost:5173/';
        },
        set href(value: string) {
          hrefSetter(value);
        },
      },
    });

    await expect(responseInterceptor.rejected(mockError)).rejects.toEqual(
      mockError
    );

    expect(removeItemSpy).toHaveBeenCalledWith('authToken');
    expect(hrefSetter).toHaveBeenCalledWith('/login');

    removeItemSpy.mockRestore();
  });
});
