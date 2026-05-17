import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { listarMisMazos } from '@/services/mazos.service';
import { inscribirseATorneo, cancelarInscripcion } from '@/services/torneos.service';
import { Button, Alert, Spinner, Select } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
import { ESTADO_TORNEO } from '@/utils/constants';
import { cupoDisponible } from '@/utils/torneos-helpers';
import './PanelInscripcion.css';

export default function PanelInscripcion({
  torneo,
  usuario,
  inscripcionPropia,
  onInscribirse,
  onCancelar,
}) {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useToast();
  const [mazos, setMazos] = useState([]);
  const [mazoSeleccionado, setMazoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoMazos, setCargandoMazos] = useState(false);
  const [error, setError] = useState(null);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);

  const esJugador = usuario?.rol === 'jugador';

  useEffect(() => {
    if (!usuario || !esJugador || inscripcionPropia) return;
    if (torneo?.estado !== ESTADO_TORNEO.PENDIENTE) return;

    setCargandoMazos(true);
    listarMisMazos()
      .then((data) => {
        const todos = Array.isArray(data) ? data : data?.mazos ?? data?.data ?? [];
        const filtrados = torneo?.formato
          ? todos.filter((m) => !m.formato || m.formato === torneo.formato)
          : todos;
        setMazos(filtrados);
      })
      .catch(() => setMazos([]))
      .finally(() => setCargandoMazos(false));
  }, [usuario, esJugador, inscripcionPropia, torneo]);

  async function handleInscribirse() {
    if (!mazoSeleccionado) {
      setError('Debes seleccionar un mazo para inscribirte.');
      return;
    }
    setCargando(true);
    setError(null);
    try {
      await inscribirseATorneo(torneo.id, { mazoId: mazoSeleccionado });
      mostrarExito('Solicitud enviada', `Tu solicitud para el torneo "${torneo.nombre}" está pendiente de aprobación.`);
      onInscribirse?.();
    } catch (e) {
      const msg = traducirError(e);
      setError(msg);
      mostrarError('No se pudo inscribir', msg);
    } finally {
      setCargando(false);
    }
  }

  async function handleCancelar() {
    setCargando(true);
    setError(null);
    try {
      await cancelarInscripcion(torneo.id, inscripcionPropia.id);
      setConfirmarCancelar(false);
      mostrarExito('Inscripción cancelada', 'Tu inscripción fue cancelada.');
      onCancelar?.();
    } catch (e) {
      const msg = traducirError(e);
      setError(msg);
      mostrarError('No se pudo cancelar', msg);
    } finally {
      setCargando(false);
    }
  }

  /* ---- Estados del panel ---- */

  // Sin autenticación
  if (!usuario) {
    return (
      <div className="panel-inscripcion">
        <p className="panel-inscripcion__mensaje">¿Querés participar en este torneo?</p>
        <Button variant="primary" onClick={() => navigate('/login')}>
          Iniciá sesión para inscribirte
        </Button>
      </div>
    );
  }

  // Rol distinto de jugador
  if (!esJugador) {
    if (usuario?.rol === 'organizador' || usuario?.rol === 'tienda') return null;
    return (
      <div className="panel-inscripcion panel-inscripcion--info">
        <p className="panel-inscripcion__mensaje">
          Solo los jugadores pueden inscribirse a torneos.
        </p>
      </div>
    );
  }

  // Ya inscrito (pendiente o confirmado)
  if (inscripcionPropia) {
    const esPendiente = inscripcionPropia.confirmado === false;
    return (
      <div className={`panel-inscripcion panel-inscripcion--${esPendiente ? 'pendiente' : 'inscrito'}`}>
        <p className={`panel-inscripcion__mensaje panel-inscripcion__mensaje--${esPendiente ? 'info' : 'ok'}`}>
          {esPendiente ? (
            <>Solicitud enviada con <strong>{inscripcionPropia.mazo?.nombre ?? 'tu mazo'}</strong>.{' '}
            Esperando aprobación del organizador. Recibirás un correo cuando sea revisada.</>
          ) : (
            <>Estás inscrito con <strong>{inscripcionPropia.mazo?.nombre ?? 'tu mazo'}</strong>.</>
          )}
        </p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button
          variant="danger"
          onClick={() => setConfirmarCancelar(true)}
          disabled={cargando}
        >
          Cancelar inscripción
        </Button>

        <Modal
          show={confirmarCancelar}
          onHide={() => setConfirmarCancelar(false)}
          title="Cancelar inscripción"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmarCancelar(false)} disabled={cargando}>
                Volver
              </Button>
              <Button variant="danger" onClick={handleCancelar} disabled={cargando}>
                {cargando ? <Spinner size="sm" /> : 'Confirmar cancelación'}
              </Button>
            </>
          }
        >
          <p className="panel-inscripcion__modal-texto">
            ¿Estás seguro de que querés cancelar tu inscripción al torneo{' '}
            <strong>{torneo?.nombre}</strong>?
          </p>
        </Modal>
      </div>
    );
  }

  // Torneo no permite inscripción (estado incorrecto)
  if (torneo?.estado !== ESTADO_TORNEO.PENDIENTE) {
    return (
      <div className="panel-inscripcion panel-inscripcion--cerrado">
        <p className="panel-inscripcion__mensaje">
          {torneo?.estado === ESTADO_TORNEO.EN_CURSO
            ? 'Las inscripciones están cerradas. El torneo ya comenzó.'
            : torneo?.estado === ESTADO_TORNEO.FINALIZADO
            ? 'Este torneo ya finalizó.'
            : 'Las inscripciones están cerradas.'}
        </p>
      </div>
    );
  }

  // Cupo lleno
  if (!cupoDisponible(torneo)) {
    return (
      <div className="panel-inscripcion panel-inscripcion--lleno">
        <p className="panel-inscripcion__mensaje">Cupo completo</p>
        <Button variant="secondary" disabled>
          Sin lugares disponibles
        </Button>
      </div>
    );
  }

  // Jugador puede inscribirse
  const mazoOpciones = [
    { value: '', label: cargandoMazos ? 'Cargando mazos...' : 'Seleccioná un mazo...' },
    ...mazos.map((m) => ({ value: m.id, label: m.nombre })),
  ];

  return (
    <div className="panel-inscripcion">
      <p className="panel-inscripcion__mensaje">¡Inscribite a este torneo!</p>

      {error && <Alert variant="danger">{error}</Alert>}

      {mazos.length === 0 && !cargandoMazos ? (
        <Alert variant="warning">
          No tenés mazos en formato {torneo?.formato ?? ''} para inscribirte.
          Creá un mazo primero desde{' '}
          <a href="/mazos" className="panel-inscripcion__link">Mis mazos</a>.
        </Alert>
      ) : (
        <>
          <div className="panel-inscripcion__campo">
            <label className="panel-inscripcion__label">Mazo</label>
            <Select
              value={mazoSeleccionado}
              onChange={(e) => setMazoSeleccionado(e.target.value)}
              options={mazoOpciones}
              disabled={cargandoMazos || cargando}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleInscribirse}
            disabled={cargando || cargandoMazos || !mazoSeleccionado}
          >
            {cargando ? <Spinner size="sm" /> : 'Solicitar inscripción'}
          </Button>
        </>
      )}
    </div>
  );
}
