import { useAuth } from '@/hooks/useAuth';
import { relativeDate } from '@/utils/formatters';
import './ListaInscritos.css';

export default function ListaInscritos({ inscripciones = [], editable = false, onCancelar }) {
  const { user } = useAuth();

  if (inscripciones.length === 0) {
    return (
      <div className="lista-inscritos__empty">
        <p className="lista-inscritos__empty-texto">Aún no hay jugadores inscritos. Sé el primero.</p>
      </div>
    );
  }

  return (
    <ul className="lista-inscritos">
      {inscripciones.map((inscripcion) => {
        const esPropio = user && (
          inscripcion.usuario_id === user.id ||
          inscripcion.jugador_id === user.id
        );

        return (
          <li key={inscripcion.id} className={`lista-inscritos__item${esPropio ? ' lista-inscritos__item--propio' : ''}`}>
            <div className="lista-inscritos__avatar">
              {(inscripcion.Jugador?.Usuario?.nombre_usuario ?? '?').substring(0, 2).toUpperCase()}
            </div>
            <div className="lista-inscritos__info">
              <span className="lista-inscritos__nombre">
                {inscripcion.Jugador?.Usuario?.nombre_usuario ?? 'Jugador'}
              </span>
              {(inscripcion.Mazo ?? inscripcion.mazo)?.nombre && (
                <span className="lista-inscritos__mazo">
                  {(inscripcion.Mazo ?? inscripcion.mazo).nombre}
                  {(inscripcion.Mazo ?? inscripcion.mazo).comandante && ` · ${(inscripcion.Mazo ?? inscripcion.mazo).comandante}`}
                </span>
              )}
              {(inscripcion.fecha_inscripcion ?? inscripcion.created_at) && (
                <span className="lista-inscritos__fecha">
                  Inscrito {relativeDate(inscripcion.fecha_inscripcion ?? inscripcion.created_at)}
                </span>
              )}
            </div>
            {editable && esPropio && onCancelar && (
              <button
                className="lista-inscritos__cancelar"
                onClick={() => onCancelar(inscripcion)}
              >
                Cancelar
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
