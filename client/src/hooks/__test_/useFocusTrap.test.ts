import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { MutableRefObject } from 'react';
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

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      (result.current as MutableRefObject<HTMLDivElement | null>).current =
        container;
    });

    rerender({ active: true });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('should not focus when inactive', () => {
    const focusSpy = vi.spyOn(button1, 'focus');

    const { result } = renderHook(() => useFocusTrap(false));

    act(() => {
      (result.current as MutableRefObject<HTMLDivElement | null>).current =
        container;
    });

    expect(focusSpy).not.toHaveBeenCalled();
  });
});
