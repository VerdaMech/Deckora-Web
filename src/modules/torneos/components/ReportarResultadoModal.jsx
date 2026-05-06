import { useState } from 'react';

import { actualizarResultado, actualizarEstado } from '@/services/enfrentamientos.service';
import { Button, Modal, Alert, Spinner, Select } from '@/components/ui';
import { RESULTADO_ENFRENTAMIENTO } from '@/utils/constants';
import './ReportarResultadoModal.css';

const RESULTADO_OPCIONES = [
  { value: RESULTADO_ENFRENTAMIENTO.PENDIENTE, label: 'Sin resultado' },
  { value: RESULTADO_ENFRENTAMIENTO.GANADOR, label: 'Ganador' },
  { value: RESULTADO_ENFRENTAMIENTO.PERDEDOR, label: 'Perdedor' },
  { value: RESULTADO_ENFRENTAMIENTO.EMPATE, label: 'Empate' },
];

function validarResultados(filas) {
  const ganadores = filas.filter((f) => f.resultado === RESULTADO_ENFRENTAMIENTO.GANADOR);
  const todos = filas.every((f) => f.resultado !== RESULTADO_ENFRENTAMIENTO.PENDIENTE);
  if (!todos) return 'Completá el resultado de todos los jugadores.';
  if (ganadores.length > 1) return 'Solo puede haber un ganador por mesa.';
  return null;
}

export default function ReportarResultadoModal({
  enfrentamiento,
  isOpen,
  onClose,
  onReportado,
}) {
  const jugadores = enfrentamiento?.jugadores ?? enfrentamiento?.participantes ?? [];

  const [filas, setFilas] = useState(() =>
    jugadores.map((j) => ({
      jugadorId: j.id,
      nombre: j.nombre_usuario ?? j.nombre ?? '—',
      resultado: j.resultado ?? RESULTADO_ENFRENTAMIENTO.PENDIENTE,
      puntos: j.puntos ?? '',
    }))
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  function actualizarFila(idx, campo, valor) {
    setFilas((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [campo]: valor } : f))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validacion = validarResultados(filas);
    if (validacion) {
      setError(validacion);
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      const datos = {
        jugadores: filas.map((f) => ({
          jugador_id: f.jugadorId,
          resultado: f.resultado,
          puntos: f.puntos !== '' ? Number(f.puntos) : null,
        })),
      };
      await actualizarResultado(enfrentamiento.id, datos);
      await actualizarEstado(enfrentamiento.id, { estado: 'finalizado' });
      onReportado?.();
      onClose();
    } catch (err) {
      setError(err.message ?? 'Error al guardar el resultado');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      title={`Reportar resultado — Mesa ${enfrentamiento?.numero_mesa ?? enfrentamiento?.mesa ?? '?'}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={guardando}>
            {guardando ? <Spinner size="sm" /> : 'Guardar resultado'}
          </Button>
        </>
      }
    >
      <form className="reportar-resultado" onSubmit={handleSubmit} noValidate>
        {error && <Alert variant="danger" className="reportar-resultado__error">{error}</Alert>}

        <div className="reportar-resultado__tabla">
          <div className="reportar-resultado__encabezado">
            <span className="reportar-resultado__col reportar-resultado__col--jugador">Jugador</span>
            <span className="reportar-resultado__col reportar-resultado__col--resultado">Resultado</span>
            <span className="reportar-resultado__col reportar-resultado__col--puntos">Puntos</span>
          </div>

          {filas.map((fila, idx) => (
            <div key={fila.jugadorId ?? idx} className="reportar-resultado__fila">
              <span className="reportar-resultado__col reportar-resultado__col--jugador reportar-resultado__nombre">
                {fila.nombre}
              </span>
              <div className="reportar-resultado__col reportar-resultado__col--resultado">
                <Select
                  value={fila.resultado}
                  onChange={(e) => actualizarFila(idx, 'resultado', e.target.value)}
                  options={RESULTADO_OPCIONES}
                />
              </div>
              <div className="reportar-resultado__col reportar-resultado__col--puntos">
                <input
                  type="number"
                  className="form-input reportar-resultado__pts-input"
                  value={fila.puntos}
                  onChange={(e) => actualizarFila(idx, 'puntos', e.target.value)}
                  min={0}
                  placeholder="—"
                  aria-label={`Puntos de ${fila.nombre ?? 'jugador'}`}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="reportar-resultado__ayuda">
          Solo puede haber un ganador por mesa, o todos en empate.
        </p>
      </form>
    </Modal>
  );
}
