import { Link } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import './BloqueResumen.css';

export default function BloqueResumen({
  titulo,
  icono: Icono,
  cta,
  vacio = false,
  cargando = false,
  children,
}) {
  return (
    <div className={`bloque-resumen${vacio ? ' bloque-resumen--vacio' : ''}`}>
      <div className="bloque-resumen__header">
        <span className="bloque-resumen__titulo">
          {Icono && <Icono size={15} className="bloque-resumen__icono" aria-hidden="true" />}
          {titulo}
        </span>
        {cta && (
          <Link to={cta.to} className="bloque-resumen__cta">
            {cta.texto}
          </Link>
        )}
      </div>
      <div className="bloque-resumen__cuerpo">
        {cargando ? (
          <div className="bloque-resumen__spinner">
            <Spinner />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
