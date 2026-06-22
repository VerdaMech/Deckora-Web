import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve el valor inicial de inmediato', () => {
    const { result } = renderHook(() => useDebounce('inicial', 300));
    expect(result.current).toBe('inicial');
  });

  it('no actualiza el valor antes de que pase el delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a');
  });

  it('actualiza el valor cuando transcurre el delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('b');
  });

  it('respeta un delay personalizado', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 1000), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('b');
  });
});
