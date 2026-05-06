import { createContext, useCallback, useContext, useId, useState } from 'react';
import Toast from '@/components/ui/Toast';

const ToastContext = createContext(null);

const MAX_TOASTS = 4;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const baseId = useId();
  let contador = 0;

  const mostrarToast = useCallback(({ variante = 'info', titulo, mensaje, duracion = 4000 }) => {
    const id = `${baseId}-${Date.now()}-${contador++}`;
    setToasts((prev) => {
      const siguiente = [...prev, { id, variante, titulo, mensaje, duracion }];
      return siguiente.length > MAX_TOASTS ? siguiente.slice(siguiente.length - MAX_TOASTS) : siguiente;
    });
    return id;
  }, [baseId]);

  const cerrarToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrarExito = useCallback((titulo, mensaje) => mostrarToast({ variante: 'exito', titulo, mensaje }), [mostrarToast]);
  const mostrarError = useCallback((titulo, mensaje) => mostrarToast({ variante: 'error', titulo, mensaje }), [mostrarToast]);
  const mostrarInfo = useCallback((titulo, mensaje) => mostrarToast({ variante: 'info', titulo, mensaje }), [mostrarToast]);
  const mostrarAdvertencia = useCallback((titulo, mensaje) => mostrarToast({ variante: 'advertencia', titulo, mensaje }), [mostrarToast]);

  return (
    <ToastContext.Provider value={{ mostrarToast, mostrarExito, mostrarError, mostrarInfo, mostrarAdvertencia }}>
      {children}
      <div
        className="toast-container"
        role="region"
        aria-label="Notificaciones"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onCerrar={cerrarToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
