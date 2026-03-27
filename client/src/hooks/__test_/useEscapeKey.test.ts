import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEscapeKey } from '../useEscapeKey';

describe('useEscapeKey', () => {
  let callback: any;

  beforeEach(() => {
    callback = vi.fn();
  });

  it('should call callback when Escape key is pressed', () => {
    renderHook(() => useEscapeKey(callback, true));
    
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when other keys are pressed', () => {
    renderHook(() => useEscapeKey(callback, true));
    
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);
    });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback when not active', () => {
    renderHook(() => useEscapeKey(callback, false));
    
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useEscapeKey(callback, true));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});