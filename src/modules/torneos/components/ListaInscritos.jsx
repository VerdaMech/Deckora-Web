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
              {(inscripcion.jugador?.nombre_usuario ?? inscripcion.usuario?.nombre_usuario ?? '?').substring(0, 2).toUpperCase()}
            </div>
            <div className="lista-inscritos__info">
              <span className="lista-inscritos__nombre">
                {inscripcion.jugador?.nombre_usuario ?? inscripcion.usuario?.nombre_usuario ?? 'Jugador'}
              </span>
              {inscripcion.mazo?.nombre && (
                <span className="lista-inscritos__mazo">
                  {inscripcion.mazo.nombre}
                  {inscripcion.mazo.comandante && ` · ${inscripcion.mazo.comandante}`}
                </span>
              )}
              {inscripcion.created_at && (
                <span className="lista-inscritos__fecha">
                  Inscrito {relativeDate(inscripcion.created_at)}
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
