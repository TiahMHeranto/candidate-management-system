import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocusTrap } from '../useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let input: HTMLInputElement;

  beforeEach(() => {
    container = document.createElement('div');
    button1 = document.createElement('button');
    button2 = document.createElement('button');
    input = document.createElement('input');
    
    container.appendChild(button1);
    container.appendChild(input);
    container.appendChild(button2);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should return container ref', () => {
    const { result } = renderHook(() => useFocusTrap(true));
    expect(result.current).toHaveProperty('current');
  });

  it('should focus first focusable element when active', () => {
    const focusSpy = vi.spyOn(button1, 'focus');
    
    renderHook(() => useFocusTrap(true));
    
    // Simuler l'effet
    act(() => {
      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);
    });
    
    // Le focus devrait être sur le premier élément focusable
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should not focus when inactive', () => {
    const focusSpy = vi.spyOn(button1, 'focus');
    
    renderHook(() => useFocusTrap(false));
    
    expect(focusSpy).not.toHaveBeenCalled();
  });
});