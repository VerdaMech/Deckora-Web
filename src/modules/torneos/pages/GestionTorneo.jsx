import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Swords } from 'lucide-react';

import { obtenerTorneo, cambiarEstadoTorneo } from '@/services/torneos.service';
import { listarRondas, crearRonda, eliminarRonda } from '@/services/rondas.service';
import { EstadoBadge } from '@/components/domain/EstadoBadge';
import { RoundView } from '@/components/domain/RoundView';
import ReportarResultadoModal from '@/modules/torneos/components/ReportarResultadoModal';
import { Button, Alert, Skeleton, Select, Spinner, Modal, EmptyState, Tabs } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { TIPO_RONDA, ESTADO_TORNEO } from '@/utils/constants';
import './GestionTorneo.css';

const TIPO_OPCIONES = Object.entries({
  [TIPO_RONDA.SWISS]: 'Swiss',
  [TIPO_RONDA.ELIMINACION_DIRECTA]: 'Eliminación directa',
  [TIPO_RONDA.FINAL]: 'Final',
}).map(([value, label]) => ({ value, label }));

export default function GestionTorneo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mostrarExito } = useToast();

  const [torneo, setTorneo] = useState(null);
  const [rondas, setRondas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [tabActivo, setTabActivo] = useState('crear');
  const [tipoRonda, setTipoRonda] = useState(TIPO_RONDA.SWISS);
  const [creandoRonda, setCreandoRonda] = useState(false);
  const [errorRonda, setErrorRonda] = useState(null);

  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [confirmarEstado, setConfirmarEstado] = useState(null);
  const [errorEstado, setErrorEstado] = useState(null);

  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [eliminandoRonda, setEliminandoRonda] = useState(false);

  const [enfrentamientoSeleccionado, setEnfrentamientoSeleccionado] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [t, r] = await Promise.all([
        obtenerTorneo(id),
        listarRondas(id).catch(() => []),
      ]);
      setTorneo(t?.torneo ?? t);
      const lista = Array.isArray(r) ? r : r?.rondas ?? r?.data ?? [];
      setRondas(lista);
      if (lista.length > 0 && tabActivo === 'crear') {
        setTabActivo(`ronda-${lista[0].id ?? 0}`);
      }
    } catch (e) {
      setError(e.message ?? 'Error al cargar la gestión del torneo');
    } finally {
      setCargando(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleCrearRonda(e) {
    e.preventDefault();
    setCreandoRonda(true);
    setErrorRonda(null);
    try {
      const nueva = await crearRonda(id, { tipo: tipoRonda });
      const rondaNueva = nueva?.ronda ?? nueva;
      setRondas((prev) => [...prev, rondaNueva]);
      setTabActivo(`ronda-${rondaNueva.id ?? rondas.length}`);
      mostrarExito('Ronda creada', 'La ronda fue creada exitosamente.');
    } catch (err) {
      setErrorRonda(err.message ?? 'Error al crear la ronda');
    } finally {
      setCreandoRonda(false);
    }
  }

  async function handleEliminarRonda(ronda) {
    setEliminandoRonda(true);
    try {
      await eliminarRonda(id, ronda.id);
      setRondas((prev) => prev.filter((r) => r.id !== ronda.id));
      setTabActivo('crear');
      setConfirmarEliminar(null);
    } catch (err) {
      setErrorRonda(err.message ?? 'Error al eliminar la ronda');
      setConfirmarEliminar(null);
    } finally {
      setEliminandoRonda(false);
    }
  }

  async function handleCambiarEstado(nuevoEstado) {
    setCambiandoEstado(true);
    setConfirmarEstado(null);
    setErrorEstado(null);
    try {
      await cambiarEstadoTorneo(id, nuevoEstado);
      setTorneo((prev) => ({ ...prev, estado: nuevoEstado }));
      const estadosSinRondas = [ESTADO_TORNEO.FINALIZADO, ESTADO_TORNEO.CANCELADO];
      if (estadosSinRondas.includes(nuevoEstado) && tabActivo === 'crear') {
        setTabActivo(rondas.length > 0 ? `ronda-${rondas[0].id ?? 0}` : null);
      }
    } catch (e) {
      setErrorEstado(e.message ?? 'Error al cambiar el estado del torneo');
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function handleResultadoReportado() {
    setEnfrentamientoSeleccionado(null);
    const r = await listarRondas(id).catch(() => []);
    const lista = Array.isArray(r) ? r : r?.rondas ?? r?.data ?? [];
    setRondas(lista);
  }

  if (cargando) {
    return (
      <div className="gestion-torneo-page">
        <Skeleton height={80} className="gestion-torneo-page__skeleton" />
        <Skeleton height={400} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-torneo-page gestion-torneo-page--error">
        <Alert variant="danger">{error}</Alert>
        <Button variant="ghost" onClick={() => navigate('/torneos')}>Volver a cartelera</Button>
      </div>
    );
  }

  const estado = torneo?.estado;

  const tabsRondas = rondas.map((r, idx) => ({
    key: `ronda-${r.id ?? idx}`,
    label: `Ronda ${r.numero ?? r.numero_ronda ?? idx + 1}`,
    ronda: r,
  }));

  return (
    <div className="gestion-torneo-page">
      {/* Header */}
      <div className="gestion-torneo-page__header">
        <div className="gestion-torneo-page__header-info">
          <h1 className="gestion-torneo-page__titulo">{torneo?.nombre}</h1>
          <div className="gestion-torneo-page__meta">
            <span className="gestion-torneo-page__formato">{torneo?.formato}</span>
            <EstadoBadge estado={estado} />
          </div>
        </div>
        <div className="gestion-torneo-page__header-acciones">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/torneos/${id}`)}
            className="gestion-torneo-page__btn-volver"
          >
            <ArrowLeft size={14} /> Volver al torneo
          </Button>
          <Link
            to={`/torneos/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gestion-torneo-page__link-publico"
          >
            <ExternalLink size={14} /> Ver página pública
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/organizador/torneos/${id}/editar`)}
          >
            Editar torneo
          </Button>
        </div>
      </div>

      {/* Acciones de estado */}
      <div className="gestion-torneo-page__estado-acciones">
        {errorEstado && <Alert variant="danger">{errorEstado}</Alert>}
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

      {/* Tabs de rondas */}
      <div className="gestion-torneo-page__body">
        {tabsRondas.length === 0 && tabActivo !== 'crear' && (
          <EmptyState
            icon={Swords}
            title="Aún no hay rondas"
            description="Creá la primera ronda para comenzar el torneo."
          />
        )}

        <Tabs activeKey={tabActivo} onSelect={setTabActivo}>
          {tabsRondas.map(({ key, label, ronda }) => (
            <Tabs.Tab key={key} eventKey={key} label={label}>
              <div className="gestion-torneo-page__ronda">
                <RoundView
                  ronda={ronda}
                  editable={estado === ESTADO_TORNEO.EN_CURSO}
                  onReportarResultado={setEnfrentamientoSeleccionado}
                />
                <div className="gestion-torneo-page__ronda-footer">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmarEliminar(ronda)}
                  >
                    Eliminar ronda
                  </Button>
                </div>
              </div>
            </Tabs.Tab>
          ))}
          {estado !== ESTADO_TORNEO.FINALIZADO && estado !== ESTADO_TORNEO.CANCELADO && (
            <Tabs.Tab eventKey="crear" label="+ Nueva ronda">
              <div className="gestion-torneo-page__crear-ronda">
                <h3 className="gestion-torneo-page__crear-titulo">Crear nueva ronda</h3>
                {errorRonda && <Alert variant="danger">{errorRonda}</Alert>}
                <form className="gestion-torneo-page__crear-form" onSubmit={handleCrearRonda}>
                  <div className="form-field">
                    <label className="form-label">Tipo de ronda</label>
                    <Select
                      value={tipoRonda}
                      onChange={(e) => setTipoRonda(e.target.value)}
                      options={TIPO_OPCIONES}
                    />
                  </div>
                  <Button type="submit" variant="primary" disabled={creandoRonda}>
                    {creandoRonda ? <Spinner size="sm" /> : 'Crear ronda'}
                  </Button>
                </form>
              </div>
            </Tabs.Tab>
          )}
        </Tabs>
      </div>

      {/* Modal reportar resultado */}
      {enfrentamientoSeleccionado && (
        <ReportarResultadoModal
          enfrentamiento={enfrentamientoSeleccionado}
          isOpen
          onClose={() => setEnfrentamientoSeleccionado(null)}
          onReportado={handleResultadoReportado}
        />
      )}

      {/* Modal confirmación eliminar ronda */}
      {confirmarEliminar && (
        <Modal
          show
          onHide={() => setConfirmarEliminar(null)}
          title="Eliminar ronda"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmarEliminar(null)} disabled={eliminandoRonda}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={() => handleEliminarRonda(confirmarEliminar)} disabled={eliminandoRonda}>
                {eliminandoRonda ? <Spinner size="sm" /> : 'Eliminar'}
              </Button>
            </>
          }
        >
          <p className="gestion-torneo-page__modal-texto">
            ¿Estás seguro de que querés eliminar la{' '}
            <strong>Ronda {confirmarEliminar.numero_ronda ?? confirmarEliminar.numero}</strong>?
            Esta acción no se puede deshacer.
          </p>
        </Modal>
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
                {cambiandoEstado ? <Spinner size="sm" /> : `Confirmar`}
              </Button>
            </>
          }
        >
          <p className="gestion-torneo-page__modal-texto">
            ¿Estás seguro de que querés <strong>{confirmarEstado.label}</strong> el torneo{' '}
            <strong>{torneo?.nombre}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}
