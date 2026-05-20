import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import '@/styles/components/Toast.css';

const ICONOS = {
  exito: CheckCircle2,
  error: XCircle,
  info: Info,
  advertencia: AlertTriangle,
};

export default function Toast({ id, variante = 'info', titulo, mensaje, duracion = 4000, onCerrar }) {
  const [saliendo, setSaliendo] = useState(false);
  const timerRef = useRef(null);
  const Icono = ICONOS[variante] ?? Info;

  const cerrar = () => {
    if (saliendo) return;
    setSaliendo(true);
    setTimeout(() => onCerrar(id), 150);
  };

  const iniciarTimer = () => {
    if (duracion === null) return;
    timerRef.current = setTimeout(cerrar, duracion);
  };

  const pausarTimer = () => {
    clearTimeout(timerRef.current);
  };

  useEffect(() => {
    iniciarTimer();
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ariaLive = variante === 'error' || variante === 'advertencia' ? 'assertive' : 'polite';
  const role = variante === 'error' || variante === 'advertencia' ? 'alert' : 'status';

  return (
    <div
      className={`toast toast--${variante}${saliendo ? ' toast--saliendo' : ''}`}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      onMouseEnter={pausarTimer}
      onMouseLeave={iniciarTimer}
    >
      <Icono className="toast__icono" size={18} aria-hidden="true" />
      <div className="toast__contenido">
        <p className="toast__titulo">{titulo}</p>
        {mensaje && <p className="toast__mensaje">{mensaje}</p>}
      </div>
      <button className="toast__cerrar" onClick={cerrar} aria-label="Cerrar notificación">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
