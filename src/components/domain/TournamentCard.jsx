import { FormatBadge } from './FormatBadge';
import { EstadoBadge } from './EstadoBadge';
import { formatFecha, formatCupo } from '@/utils/formatters';

export function TournamentCard({ torneo, onClick }) {
  if (!torneo) return null;

  const inscritos = torneo.inscritos_count ?? torneo.inscripciones_count ?? 0;
  const cupoTexto = formatCupo(inscritos, torneo.cupo_maximo);

  return (
    <article className="tournament-card" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="tournament-card__image">
        <div className="tournament-card__gradient" />
        <div className="tournament-card__badges">
          <FormatBadge formato={torneo.formato} />
          <EstadoBadge estado={torneo.estado} />
        </div>
      </div>

      <div className="tournament-card__body">
        <h3 className="tournament-card__name">{torneo.nombre}</h3>

        <div className="tournament-card__meta">
          {torneo.fecha_inicio && (
            <span className="tournament-card__meta-item">
              {formatFecha(torneo.fecha_inicio)}
            </span>
          )}
          {torneo.ubicacion && (
            <span className="tournament-card__meta-item">
              {torneo.ubicacion}
            </span>
          )}
          <span className="tournament-card__cupo">{cupoTexto}</span>
        </div>
      </div>
    </article>
  );
}

export default TournamentCard;
