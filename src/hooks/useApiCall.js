import { useCallback, useEffect, useRef, useState } from 'react';
import { traducirError } from '@/utils/errors';

export function useApiCall(fnAsync, { umbralColdStart = 3000, autoEjecutar = false } = {}) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mostrandoColdStart, setMostrandoColdStart] = useState(false);
  const timerRef = useRef(null);
  const ejecutadoRef = useRef(false);

  const ejecutar = useCallback(async (...args) => {
    setCargando(true);
    setError(null);
    setMostrandoColdStart(false);

    timerRef.current = setTimeout(() => setMostrandoColdStart(true), umbralColdStart);

    try {
      const resultado = await fnAsync(...args);
      setDatos(resultado);
      return resultado;
    } catch (err) {
      const msg = traducirError(err);
      setError(msg);
      throw err;
    } finally {
      clearTimeout(timerRef.current);
      setCargando(false);
      setMostrandoColdStart(false);
    }
  }, [fnAsync, umbralColdStart]);

  useEffect(() => {
    if (autoEjecutar && !ejecutadoRef.current) {
      ejecutadoRef.current = true;
      ejecutar();
    }
    return () => clearTimeout(timerRef.current);
  }, [autoEjecutar, ejecutar]);

  return { ejecutar, datos, error, cargando, mostrandoColdStart };
}
