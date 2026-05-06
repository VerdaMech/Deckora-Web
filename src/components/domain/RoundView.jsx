import { EstadoBadge } from './EstadoBadge';
import { PodTable } from './PodTable';
import { EmptyState } from '@/components/ui';
import { TIPO_RONDA } from '@/utils/constants';

const TIPO_LABELS = {
  [TIPO_RONDA.SWISS]: 'Swiss',
  [TIPO_RONDA.ELIMINACION_DIRECTA]: 'Eliminación directa',
  [TIPO_RONDA.FINAL]: 'Final',
};

export function RoundView({ ronda, editable = false, onReportarResultado }) {
  if (!ronda) return null;

  const enfrentamientos = ronda.enfrentamientos ?? ronda.mesas ?? [];
  const tipoLabel = TIPO_LABELS[ronda.tipo] ?? ronda.tipo ?? '';

  return (
    <div className="round-view">
      <div className="round-view__header">
        <div className="round-view__header-info">
          <span className="round-view__numero">Ronda {ronda.numero ?? ronda.numero_ronda ?? '?'}</span>
          {tipoLabel && <span className="round-view__tipo">{tipoLabel}</span>}
        </div>
        <EstadoBadge estado={ronda.estado} />
      </div>

      {enfrentamientos.length === 0 ? (
        <div className="round-view__empty">
          <p className="round-view__empty-texto">Sin mesas asignadas en esta ronda.</p>
        </div>
      ) : (
        <div className="round-view__pods">
          {enfrentamientos.map((enf, idx) => (
            <PodTable
              key={enf.id ?? idx}
              enfrentamiento={enf}
              editable={editable}
              onReportarResultado={onReportarResultado}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RoundView;
