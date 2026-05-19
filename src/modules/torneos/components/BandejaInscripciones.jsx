import { useEffect, useState, useCallback } from 'react';

import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { listarPendientes, aprobarInscripcion, rechazarInscripcion } from '@/services/torneos.service';
import { traducirError } from '@/utils/errors';
import SnapshotMazoModal from './SnapshotMazoModal';
import './BandejaInscripciones.css';

export default function BandejaInscripciones({ torneos = [], onCambio }) {
  const { mostrarExito, mostrarError } = useToast();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [snapshotInscripcion, setSnapshotInscripcion] = useState(null);

  const cargar = useCallback(async () => {
    if (!torneos.length) {
      setSolicitudes([]);
      return;
    }
    setCargando(true);
    try {
      const resultados = await Promise.allSettled(
        torneos.map((t) =>
          listarPendientes(t.id).then((ins) =>
            (Array.isArray(ins) ? ins : []).map((i) => ({ ...i, torneoNombre: t.nombre, torneoId: t.id }))
          )
        )
      );
      const todas = resultados
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value);
      setSolicitudes(todas);
    } finally {
      setCargando(false);
    }
  }, [torneos]);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleAprobar(torneoId, inscripcionId, nombreJugador) {
    setProcesando(inscripcionId);
    try {
      await aprobarInscripcion(torneoId, inscripcionId);
      setSolicitudes((prev) => prev.filter((s) => s.id !== inscripcionId));
      mostrarExito('Solicitud aprobada', `${nombreJugador} fue aprobado. Se le notificará por correo.`);
      onCambio?.();
    } catch (err) {
      mostrarError('No se pudo aprobar', traducirError(err));
    } finally {
      setProcesando(null);
    }
  }

  async function handleRechazar(torneoId, inscripcionId, nombreJugador) {
    setProcesando(inscripcionId);
    try {
      await rechazarInscripcion(torneoId, inscripcionId);
      setSolicitudes((prev) => prev.filter((s) => s.id !== inscripcionId));
      mostrarExito('Solicitud rechazada', `La solicitud de ${nombreJugador} fue rechazada. Se le notificará por correo.`);
      onCambio?.();
    } catch (err) {
      mostrarError('No se pudo rechazar', traducirError(err));
    } finally {
      setProcesando(null);
    }
  }

  if (!torneos.length) return null;

  return (
    <section className="bandeja-inscripciones">
      <h2 className="bandeja-inscripciones__titulo">Solicitudes de inscripción</h2>

      {cargando ? (
        <div className="bandeja-inscripciones__cargando">
          <Spinner />
        </div>
      ) : solicitudes.length === 0 ? (
        <p className="bandeja-inscripciones__vacio">No hay solicitudes pendientes.</p>
      ) : (
        <ul className="bandeja-inscripciones__lista">
          {solicitudes.map((s) => {
            const nombreJugador = s.Jugador?.Usuario?.nombre_usuario ?? s.Jugador?.Usuario?.correo ?? 'Jugador';
            const nombreMazo = s.Mazo?.nombre ?? 'Sin mazo';
            const enProceso = procesando === s.id;
            return (
              <li key={s.id} className="bandeja-inscripciones__item">
                <div className="bandeja-inscripciones__info">
                  <span className="bandeja-inscripciones__jugador">{nombreJugador}</span>
                  <span className="bandeja-inscripciones__separador">·</span>
                  <span className="bandeja-inscripciones__torneo">{s.torneoNombre}</span>
                  <span className="bandeja-inscripciones__separador">·</span>
                  <span className="bandeja-inscripciones__mazo">{nombreMazo}</span>
                </div>
                <div className="bandeja-inscripciones__acciones">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSnapshotInscripcion(s)}
                    disabled={enProceso}
                  >
                    Ver mazo
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAprobar(s.torneoId, s.id, nombreJugador)}
                    disabled={enProceso}
                  >
                    {enProceso ? <Spinner size="sm" /> : 'Aprobar'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRechazar(s.torneoId, s.id, nombreJugador)}
                    disabled={enProceso}
                  >
                    {enProceso ? <Spinner size="sm" /> : 'Rechazar'}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {snapshotInscripcion && (
        <SnapshotMazoModal
          torneoId={snapshotInscripcion.torneoId}
          inscripcion={snapshotInscripcion}
          onClose={() => setSnapshotInscripcion(null)}
        />
      )}
    </section>
  );
}
