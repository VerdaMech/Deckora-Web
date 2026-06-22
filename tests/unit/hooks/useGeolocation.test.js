import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeolocation } from '@/hooks/useGeolocation';

const originalGeo = navigator.geolocation;

describe('useGeolocation', () => {
  let getCurrentPosition;

  beforeEach(() => {
    getCurrentPosition = vi.fn();
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', { value: originalGeo, configurable: true });
  });

  it('estado inicial: sin coords, sin error, sin loading', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('requestLocation guarda las coordenadas en caso de éxito', async () => {
    getCurrentPosition.mockImplementation((success) =>
      success({ coords: { latitude: -33.4, longitude: -70.6 } }),
    );
    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.requestLocation());
    await waitFor(() => expect(result.current.coords).toEqual({ lat: -33.4, lng: -70.6 }));
    expect(result.current.loading).toBe(false);
  });

  it('mapea el código de error a un mensaje conocido', async () => {
    getCurrentPosition.mockImplementation((_success, error) => error({ code: 1 }));
    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.requestLocation());
    await waitFor(() => expect(result.current.error).toBe('Permiso denegado'));
  });

  it('usa "Error desconocido" para códigos no mapeados', async () => {
    getCurrentPosition.mockImplementation((_success, error) => error({ code: 99 }));
    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.requestLocation());
    await waitFor(() => expect(result.current.error).toBe('Error desconocido'));
  });

  it('reporta "No disponible" si el navegador no soporta geolocalización', () => {
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });
    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.requestLocation());
    expect(result.current.error).toBe('No disponible');
  });

  it('autoRequest dispara la solicitud al montar', async () => {
    getCurrentPosition.mockImplementation((success) =>
      success({ coords: { latitude: 1, longitude: 2 } }),
    );
    renderHook(() => useGeolocation({ autoRequest: true }));
    await waitFor(() => expect(getCurrentPosition).toHaveBeenCalled());
  });
});
