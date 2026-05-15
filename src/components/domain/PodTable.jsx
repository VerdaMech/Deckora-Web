import { useState, useEffect } from 'react';
import { EstadoBadge } from './EstadoBadge';
import { RESULTADO_ENFRENTAMIENTO } from '@/utils/constants';
import { Button } from '@/components/ui';
import ReportarResultadoModal from '@/modules/torneos/components/ReportarResultadoModal';

function getInitials(nombre) {
  return (nombre ?? '?').substring(0, 2).toUpperCase();
}

function ResultadoLabel({ resultado }) {
  if (!resultado) return <span className="pod-table__resultado pod-table__resultado--pendiente">—</span>;
  const map = {
    [RESULTADO_ENFRENTAMIENTO.GANADOR]: { label: 'Ganador', mod: 'ganador' },
    [RESULTADO_ENFRENTAMIENTO.PERDEDOR]: { label: 'Perdedor', mod: 'perdedor' },
    [RESULTADO_ENFRENTAMIENTO.EMPATE]: { label: 'Empate', mod: 'empate' },
    [RESULTADO_ENFRENTAMIENTO.PENDIENTE]: { label: '—', mod: 'pendiente' },
  };
  const { label, mod } = map[resultado] ?? { label: resultado, mod: 'pendiente' };
  return <span className={`pod-table__resultado pod-table__resultado--${mod}`}>{label}</span>;
}

export function PodTable({ enfrentamiento, editable = false, onReportarResultado }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [enfrentamientoLocal, setEnfrentamientoLocal] = useState(enfrentamiento);

  useEffect(() => {
    setEnfrentamientoLocal(enfrentamiento);
  }, [enfrentamiento]);

  if (!enfrentamiento) return null;

  const jugadores = enfrentamientoLocal.participantes ?? [];
  const numero = enfrentamientoLocal.numero_mesa ?? enfrentamientoLocal.mesa ?? enfrentamientoLocal.numero ?? '?';

  function abrirModal() {
    if (onReportarResultado) {
      onReportarResultado(enfrentamientoLocal);
    } else {
      setModalAbierto(true);
    }
  }

  function handleReportado() {
    setEnfrentamientoLocal((prev) => ({ ...prev, estado: 'finalizado' }));
    setModalAbierto(false);
  }

  return (
    <div className="pod-table">
      <div className="pod-table__header">
        <span className="pod-table__titulo">Mesa {numero}</span>
        <EstadoBadge estado={enfrentamientoLocal.estado} />
      </div>

      <table className="pod-table__tabla">
        <thead>
          <tr>
            <th className="pod-table__th">Jugador</th>
            <th className="pod-table__th">Mazo / Comandante</th>
            <th className="pod-table__th">Resultado</th>
            <th className="pod-table__th pod-table__th--pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {jugadores.map((j, idx) => (
            <tr key={j.id ?? idx} className="pod-table__row">
              <td className="pod-table__td pod-table__td--jugador">
                <div className="pod-table__avatar">{getInitials(j.nombre_usuario ?? j.nombre)}</div>
                <span className="pod-table__nombre">{j.nombre_usuario ?? j.nombre ?? '—'}</span>
              </td>
              <td className="pod-table__td pod-table__td--mazo">
                <span className="pod-table__mazo-nombre">{j.mazo?.nombre ?? '—'}</span>
                {j.mazo?.comandante && (
                  <span className="pod-table__comandante">{j.mazo.comandante}</span>
                )}
              </td>
              <td className="pod-table__td">
                <ResultadoLabel resultado={j.resultado} />
              </td>
              <td className="pod-table__td pod-table__td--pts">
                {j.puntos ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editable && enfrentamientoLocal.estado !== 'finalizado' && (
        <div className="pod-table__footer">
          <Button variant="ghost" size="sm" onClick={abrirModal}>
            Reportar resultado
          </Button>
        </div>
      )}

      {modalAbierto && (
        <ReportarResultadoModal
          enfrentamiento={enfrentamientoLocal}
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onReportado={handleReportado}
        />
      )}
    </div>
  );
}

export default PodTable;
