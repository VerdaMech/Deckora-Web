import { useEffect, useState } from 'react';
import { Modal, Spinner, Alert } from '@/components/ui';
import { obtenerSnapshotInscripcion } from '@/services/torneos.service';
import './SnapshotMazoModal.css';

export default function SnapshotMazoModal({ torneoId, inscripcion, onClose }) {
  const [cartas, setCartas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!inscripcion) return;
    setCargando(true);
    setError(null);
    obtenerSnapshotInscripcion(torneoId, inscripcion.id)
      .then((data) => setCartas(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message ?? 'Error al cargar el mazo'))
      .finally(() => setCargando(false));
  }, [torneoId, inscripcion]);

  const nombreJugador = inscripcion?.Jugador?.Usuario?.nombre_usuario
    ?? inscripcion?.Jugador?.Usuario?.correo
    ?? 'Jugador';
  const nombreMazo = inscripcion?.Mazo?.nombre ?? 'Sin nombre';

  return (
    <Modal
      show={!!inscripcion}
      onHide={onClose}
      title={`${nombreMazo} — ${nombreJugador}`}
      size="lg"
    >
      {cargando ? (
        <div className="snapshot-modal__cargando">
          <Spinner />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : cartas.length === 0 ? (
        <p className="snapshot-modal__vacio">Este mazo no tiene cartas registradas.</p>
      ) : (
        <ul className="snapshot-modal__lista">
          {cartas.map((entrada) => {
            const carta = entrada.Carta ?? entrada;
            return (
              <li key={entrada.id} className="snapshot-modal__carta">
                {carta.imagen_url ? (
                  <img
                    src={carta.imagen_url}
                    alt={carta.nombre}
                    className="snapshot-modal__imagen"
                    loading="lazy"
                  />
                ) : (
                  <div className="snapshot-modal__imagen snapshot-modal__imagen--placeholder" />
                )}
                <div className="snapshot-modal__info">
                  <span className="snapshot-modal__nombre">{carta.nombre}</span>
                  <span className="snapshot-modal__tipo">{carta.tipo}</span>
                </div>
                <span className="snapshot-modal__cantidad">×{entrada.cantidad}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
