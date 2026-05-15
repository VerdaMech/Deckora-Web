import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import './PanelValidacion.css';

const FORMATO_LIMITE = {
  COMMANDER: 100, STANDARD: 60, MODERN: 60, LEGACY: 60, VINTAGE: 60, PIONEER: 60, PAUPER: 60,
};

export function PanelValidacion({ validacion, formato = 'COMMANDER', totalCartas = 0, cargando = false }) {
  const limite = FORMATO_LIMITE[formato?.toUpperCase()] ?? 60;
  const porcentaje = Math.min(100, Math.round((totalCartas / limite) * 100));

  if (cargando) {
    return (
      <div className="panel-validacion panel-validacion--cargando">
        <Loader2 size={16} className="panel-validacion__spinner" />
        <span className="panel-validacion__cargando-texto">Validando mazo...</span>
      </div>
    );
  }

  if (!validacion) {
    return (
      <div className="panel-validacion panel-validacion--sin-datos">
        <p className="panel-validacion__hint">El panel de validación se actualizará automáticamente.</p>
      </div>
    );
  }

  const esValido = validacion.valido ?? validacion.valid ?? false;
  const reglas = validacion.reglas ?? validacion.rules ?? validacion.errores ?? validacion.errors ?? [];
  const advertencias = validacion.advertencias ?? validacion.warnings ?? [];

  const variant = esValido ? 'success' : reglas.length > 0 ? 'danger' : 'warning';
  const EstadoIcon = variant === 'success' ? CheckCircle2 : variant === 'warning' ? AlertTriangle : XCircle;
  const textoEstado = variant === 'success' ? 'Mazo válido' : variant === 'warning' ? 'Con observaciones' : 'Mazo inválido';

  return (
    <div className={`panel-validacion panel-validacion--${variant}`}>
      <div className="panel-validacion__header">
        <EstadoIcon size={16} />
        <span className="panel-validacion__estado">{textoEstado}</span>
      </div>

      <div className="panel-validacion__progreso">
        <div className="panel-validacion__progreso-barra">
          <div
            className={`panel-validacion__progreso-fill panel-validacion__progreso-fill--${variant}`}
            style={{ width: porcentaje + '%' }}
          />
        </div>
        <span className="panel-validacion__progreso-texto">
          {totalCartas} / {limite} cartas
        </span>
      </div>

      {reglas.length > 0 && (
        <ul className="panel-validacion__lista panel-validacion__lista--errores">
          {reglas.map((r, i) => (
            <li key={i} className="panel-validacion__item panel-validacion__item--error">
              <XCircle size={12} />
              <span>{typeof r === 'string' ? r : r.mensaje ?? r.message ?? JSON.stringify(r)}</span>
            </li>
          ))}
        </ul>
      )}

      {advertencias.length > 0 && (
        <ul className="panel-validacion__lista panel-validacion__lista--advertencias">
          {advertencias.map((a, i) => (
            <li key={i} className="panel-validacion__item panel-validacion__item--warning">
              <AlertTriangle size={12} />
              <span>{typeof a === 'string' ? a : a.mensaje ?? a.message ?? JSON.stringify(a)}</span>
            </li>
          ))}
        </ul>
      )}

      {esValido && reglas.length === 0 && advertencias.length === 0 && (
        <p className="panel-validacion__ok">El mazo cumple todas las reglas del formato.</p>
      )}
    </div>
  );
}

export default PanelValidacion;
