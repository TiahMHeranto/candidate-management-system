import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

const mockItems = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

describe('usePagination', () => {
  it('should initialize with page 1', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.paginatedItems[0]).toEqual({ id: 1, name: 'Item 1' });
  });

  it('should calculate correct total pages', () => {
    const { result: result1 } = renderHook(() => usePagination(mockItems, 10));
    expect(result1.current.totalPages).toBe(3);
    
    const { result: result2 } = renderHook(() => usePagination(mockItems, 5));
    expect(result2.current.totalPages).toBe(5);
    
    const { result: result3 } = renderHook(() => usePagination([], 10));
    expect(result3.current.totalPages).toBe(1);
  });

  it('should go to specific page', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));
    
    act(() => {
      result.current.goToPage(2);
    });
    
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems[0]).toEqual({ id: 11, name: 'Item 11' });
  });

  it('should not go to page less than 1', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));
    
    act(() => {
      result.current.goToPage(0);
    });
    
    expect(result.current.currentPage).toBe(1);
  });

  it('should not go to page greater than totalPages', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));
    
    act(() => {
      result.current.goToPage(5);
    });
    
    expect(result.current.currentPage).toBe(3);
  });

  it('should go to next page', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(2);
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(3);
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(3);
  });

  it('should go to previous page', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));
    
    act(() => {
      result.current.goToPage(3);
    });
    
    expect(result.current.currentPage).toBe(3);
    
    act(() => {
      result.current.previousPage();
    });
    
    expect(result.current.currentPage).toBe(2);
    
    act(() => {
      result.current.previousPage();
    });
    
    expect(result.current.currentPage).toBe(1);
    
    act(() => {
      result.current.previousPage();
    });
    
    expect(result.current.currentPage).toBe(1);
  });

  it('should reset to page 1 when items change', () => {
    const { result, rerender } = renderHook(
      ({ items }) => usePagination(items, 10),
      { initialProps: { items: mockItems } }
    );
    
    act(() => {
      result.current.goToPage(3);
    });
    
    expect(result.current.currentPage).toBe(3);
    
    const newItems = mockItems.slice(0, 5);
    rerender({ items: newItems });
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });
});