import { useState, useCallback, useEffect } from 'react';

const ERRORES = {
  1: 'Permiso denegado',
  2: 'No disponible',
  3: 'Tiempo agotado',
};

export function useGeolocation({ autoRequest = false } = {}) {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('No disponible');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      ({ code }) => {
        setError(ERRORES[code] ?? 'Error desconocido');
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  useEffect(() => {
    if (autoRequest) requestLocation();
  }, [autoRequest, requestLocation]);

  return { coords, error, loading, requestLocation };
}
