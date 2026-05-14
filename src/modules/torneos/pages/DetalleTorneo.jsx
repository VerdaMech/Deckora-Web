import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { obtenerTorneo, listarInscripciones, cambiarEstadoTorneo } from '@/services/torneos.service';
import { listarRondas } from '@/services/rondas.service';
import { EstadoBadge } from '@/components/domain/EstadoBadge';
import { FormatBadge } from '@/components/domain/FormatBadge';
import { RoundView } from '@/components/domain/RoundView';
import ListaInscritos from '../components/ListaInscritos';
import PanelInscripcion from '../components/PanelInscripcion';
import BandejaInscripciones from '../components/BandejaInscripciones';
import ReportarResultadoModal from '../components/ReportarResultadoModal';
import { Button, Alert, Skeleton, Modal, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ESTADO_TORNEO, ROLES } from '@/utils/constants';
import { formatFecha, formatHora, formatCupo } from '@/utils/formatters';
import './DetalleTorneo.css';

export default function DetalleTorneo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [torneo, setTorneo] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [rondas, setRondas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [confirmarEstado, setConfirmarEstado] = useState(null);
  const [errorEstado, setErrorEstado] = useState(null);

  const [enfrentamientoSeleccionado, setEnfrentamientoSeleccionado] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [t, ins] = await Promise.all([
        obtenerTorneo(id),
        listarInscripciones(id).catch(() => []),
      ]);
      const torneoData = t?.torneo ?? t;
      setTorneo(torneoData);
      setInscripciones(Array.isArray(ins) ? ins : ins?.inscripciones ?? ins?.data ?? []);

      if (
        torneoData?.estado === ESTADO_TORNEO.EN_CURSO ||
        torneoData?.estado === ESTADO_TORNEO.FINALIZADO
      ) {
        const r = await listarRondas(id).catch(() => []);
        setRondas(Array.isArray(r) ? r : r?.rondas ?? r?.data ?? []);
      }
    } catch (e) {
      setError(e.message ?? 'Error al cargar el torneo');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  async function handleResultadoReportado() {
    setEnfrentamientoSeleccionado(null);
    const r = await listarRondas(id).catch(() => []);
    setRondas(Array.isArray(r) ? r : r?.rondas ?? r?.data ?? []);
  }

  async function handleCambiarEstado(nuevoEstado) {
    setCambiandoEstado(true);
    setConfirmarEstado(null);
    setErrorEstado(null);
    try {
      await cambiarEstadoTorneo(id, nuevoEstado);
      setTorneo((prev) => ({ ...prev, estado: nuevoEstado }));
      if (nuevoEstado === ESTADO_TORNEO.EN_CURSO || nuevoEstado === ESTADO_TORNEO.FINALIZADO) {
        const r = await listarRondas(id).catch(() => []);
        setRondas(Array.isArray(r) ? r : r?.rondas ?? r?.data ?? []);
      }
    } catch (e) {
      setErrorEstado(e.message ?? 'Error al cambiar el estado del torneo');
    } finally {
      setCambiandoEstado(false);
    }
  }

  const inscripcionPropia = user
    ? inscripciones.find(
        (i) => i.usuario_id === user.id || i.jugador_id === user.id
      )
    : null;

  if (cargando) {
    return (
      <div className="detalle-torneo-page">
        <Skeleton height={320} className="detalle-torneo__skeleton-header" />
        <div className="detalle-torneo__body">
          <Skeleton height={120} />
          <Skeleton height={200} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-torneo-page detalle-torneo-page--error">
        <Alert variant="danger">{error}</Alert>
        <Button variant="ghost" onClick={() => navigate('/torneos')}>
          Volver a cartelera
        </Button>
      </div>
    );
  }

  if (!torneo) return null;

  const inscritos = torneo.inscritos_count ?? torneo.inscripciones_count ?? inscripciones.length;
  const estado = torneo.estado;

  const esOrganizador =
    user != null &&
    (user.rol === ROLES.ORGANIZADOR || user.rol === ROLES.TIENDA) &&
    user.id === torneo?.organizador_id;

  return (
    <div className="detalle-torneo-page">
      {/* Header inmersivo */}
      <div className="detalle-torneo__header">
        <div className="detalle-torneo__header-overlay" />
        <div className="detalle-torneo__header-content">
          <button className="detalle-torneo__volver" onClick={() => navigate('/torneos')}>
            <ArrowLeft size={16} /> Cartelera
          </button>

          <div className="detalle-torneo__badges">
            <FormatBadge formato={torneo.formato} />
            <EstadoBadge estado={estado} />
          </div>

          <h1 className="detalle-torneo__nombre">{torneo.nombre}</h1>

          <div className="detalle-torneo__meta">
            {torneo.fecha && (
              <span className="detalle-torneo__meta-item">
                {formatFecha(torneo.fecha)}
                {' · '}{formatHora(torneo.fecha)}
              </span>
            )}
            {torneo.ubicacion && (
              <span className="detalle-torneo__meta-item">{torneo.ubicacion}</span>
            )}
            <span className="detalle-torneo__meta-item detalle-torneo__cupo">
              Cupo: {formatCupo(inscritos, torneo.cupo_maximo)}
            </span>
            {(torneo.organizador || torneo.tienda) && (
              <span className="detalle-torneo__meta-item">
                Organizado por{' '}
                <Link
                  to={`/u/${torneo.organizador?.nombre_usuario ?? torneo.tienda?.nombre_usuario}`}
                  className="detalle-torneo__org-link"
                >
                  {torneo.organizador?.nombre_usuario ?? torneo.tienda?.nombre ?? 'Organizador'}
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="detalle-torneo__body">
        {/* Descripción */}
        {torneo.descripcion && (
          <section className="detalle-torneo__section">
            <h2 className="detalle-torneo__section-title">Descripción</h2>
            <p className="detalle-torneo__descripcion">{torneo.descripcion}</p>
          </section>
        )}

        {esOrganizador ? (
          <>
            {/* Panel de administración para organizador/tienda */}
            <section className="detalle-torneo__section">
              <h2 className="detalle-torneo__section-title">Administración</h2>

              {errorEstado && <Alert variant="danger">{errorEstado}</Alert>}

              <div className="detalle-torneo__admin-acciones">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/organizador/torneos/${id}/gestion`)}
                >
                  Gestionar torneo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/organizador/torneos/${id}/editar`)}
                >
                  Editar torneo
                </Button>
                {estado === ESTADO_TORNEO.PENDIENTE && (
                  <Button
                    variant="primary"
                    onClick={() => setConfirmarEstado({ nuevo: ESTADO_TORNEO.EN_CURSO, label: 'publicar' })}
                    disabled={cambiandoEstado}
                  >
                    {cambiandoEstado ? <Spinner size="sm" /> : 'Publicar torneo'}
                  </Button>
                )}
                {estado === ESTADO_TORNEO.EN_CURSO && (
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmarEstado({ nuevo: ESTADO_TORNEO.FINALIZADO, label: 'finalizar' })}
                    disabled={cambiandoEstado}
                  >
                    {cambiandoEstado ? <Spinner size="sm" /> : 'Finalizar torneo'}
                  </Button>
                )}
                {(estado === ESTADO_TORNEO.PENDIENTE || estado === ESTADO_TORNEO.EN_CURSO) && (
                  <Button
                    variant="danger"
                    onClick={() => setConfirmarEstado({ nuevo: ESTADO_TORNEO.CANCELADO, label: 'cancelar' })}
                    disabled={cambiandoEstado}
                  >
                    Cancelar torneo
                  </Button>
                )}
              </div>
            </section>

            {/* Inscripciones pendientes para el organizador */}
            <section className="detalle-torneo__section">
              <h2 className="detalle-torneo__section-title">
                Inscritos ({inscripciones.length})
              </h2>
              {estado === ESTADO_TORNEO.PENDIENTE && (
                <BandejaInscripciones torneos={[{ id: torneo.id, nombre: torneo.nombre }]} />
              )}
              <ListaInscritos
                inscripciones={inscripciones}
                editable={false}
                onCancelar={cargarDatos}
              />
            </section>

            {/* Rondas editables para el organizador cuando el torneo está en curso */}
            <section className="detalle-torneo__section detalle-torneo__section--rondas">
              <h2 className="detalle-torneo__section-title">Rondas</h2>
              {estado === ESTADO_TORNEO.PENDIENTE ? (
                <div className="detalle-torneo__rondas-placeholder">
                  <p className="detalle-torneo__placeholder-text">
                    Las rondas aparecerán cuando el torneo inicie.
                  </p>
                </div>
              ) : rondas.length === 0 ? (
                <div className="detalle-torneo__rondas-placeholder">
                  <p className="detalle-torneo__placeholder-text">
                    El torneo comenzó pero aún no hay rondas creadas.
                  </p>
                </div>
              ) : (
                <div className="detalle-torneo__rondas-lista">
                  {rondas.map((ronda, idx) => (
                    <RoundView
                      key={ronda.id ?? idx}
                      ronda={ronda}
                      editable={estado === ESTADO_TORNEO.EN_CURSO}
                      onReportarResultado={estado === ESTADO_TORNEO.EN_CURSO ? setEnfrentamientoSeleccionado : undefined}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Vista para jugadores y anónimos */}
            <section className="detalle-torneo__section" id="inscripcion">
              <h2 className="detalle-torneo__section-title">Inscripción</h2>
              <PanelInscripcion
                torneo={torneo}
                usuario={user}
                inscripcionPropia={inscripcionPropia}
                onInscribirse={cargarDatos}
                onCancelar={cargarDatos}
              />
            </section>

            <section className="detalle-torneo__section">
              <h2 className="detalle-torneo__section-title">
                Inscritos ({inscripciones.length})
              </h2>
              <ListaInscritos
                inscripciones={inscripciones}
                editable={false}
                onCancelar={cargarDatos}
              />
            </section>

            <section className="detalle-torneo__section detalle-torneo__section--rondas">
              <h2 className="detalle-torneo__section-title">Rondas</h2>
              {estado === ESTADO_TORNEO.PENDIENTE ? (
                <div className="detalle-torneo__rondas-placeholder">
                  <p className="detalle-torneo__placeholder-text">
                    Las rondas aparecerán cuando el torneo inicie.
                  </p>
                </div>
              ) : rondas.length === 0 ? (
                <div className="detalle-torneo__rondas-placeholder">
                  <p className="detalle-torneo__placeholder-text">
                    El torneo comenzó pero aún no hay rondas creadas.
                  </p>
                </div>
              ) : (
                <div className="detalle-torneo__rondas-lista">
                  {rondas.map((ronda, idx) => (
                    <RoundView key={ronda.id ?? idx} ronda={ronda} editable={false} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <div className="detalle-torneo__footer-actions">
          <Button variant="ghost" onClick={() => navigate('/torneos')}>
            <ArrowLeft size={16} /> Volver a cartelera
          </Button>
        </div>
      </div>

      {/* Modal reportar resultado (organizador) */}
      {enfrentamientoSeleccionado && (
        <ReportarResultadoModal
          enfrentamiento={enfrentamientoSeleccionado}
          isOpen
          onClose={() => setEnfrentamientoSeleccionado(null)}
          onReportado={handleResultadoReportado}
        />
      )}

      {/* Modal confirmación cambio de estado */}
      {confirmarEstado && (
        <Modal
          show
          onHide={() => setConfirmarEstado(null)}
          title="Confirmar acción"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmarEstado(null)} disabled={cambiandoEstado}>
                Cancelar
              </Button>
              <Button
                variant={confirmarEstado.nuevo === ESTADO_TORNEO.CANCELADO ? 'danger' : 'primary'}
                onClick={() => handleCambiarEstado(confirmarEstado.nuevo)}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado ? <Spinner size="sm" /> : 'Confirmar'}
              </Button>
            </>
          }
        >
          <p>
            ¿Estás seguro de que querés <strong>{confirmarEstado.label}</strong> el torneo{' '}
            <strong>{torneo?.nombre}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}
