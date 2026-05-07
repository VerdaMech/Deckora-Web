import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { obtenerTorneo, listarInscripciones } from '@/services/torneos.service';
import { listarRondas } from '@/services/rondas.service';
import { EstadoBadge } from '@/components/domain/EstadoBadge';
import { FormatBadge } from '@/components/domain/FormatBadge';
import { RoundView } from '@/components/domain/RoundView';
import ListaInscritos from '../components/ListaInscritos';
import PanelInscripcion from '../components/PanelInscripcion';
import { Button, Alert, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ESTADO_TORNEO } from '@/utils/constants';
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
            <EstadoBadge estado={torneo.estado} />
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

        {/* Inscripción */}
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

        {/* Inscritos */}
        <section className="detalle-torneo__section">
          <h2 className="detalle-torneo__section-title">
            Inscritos ({inscripciones.length})
          </h2>
          <ListaInscritos
            inscripciones={inscripciones}
            editable
            onCancelar={cargarDatos}
          />
        </section>

        {/* Rondas */}
        <section className="detalle-torneo__section detalle-torneo__section--rondas">
          <h2 className="detalle-torneo__section-title">Rondas</h2>
          {torneo.estado === ESTADO_TORNEO.PENDIENTE ? (
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

        <div className="detalle-torneo__footer-actions">
          <Button variant="ghost" onClick={() => navigate('/torneos')}>
            <ArrowLeft size={16} /> Volver a cartelera
          </Button>
        </div>
      </div>
    </div>
  );
}
