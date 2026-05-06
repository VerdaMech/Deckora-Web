import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { obtenerTorneo } from '@/services/torneos.service';
import { listarInscripciones } from '@/services/torneos.service';
import { EstadoBadge } from '@/components/domain/EstadoBadge';
import { FormatBadge } from '@/components/domain/FormatBadge';
import ListaInscritos from '../components/ListaInscritos';
import { Button, Alert, Skeleton } from '@/components/ui';
import { formatFecha, formatHora, formatCupo } from '@/utils/formatters';
import './DetalleTorneo.css';

export default function DetalleTorneo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [torneo, setTorneo] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const [t, ins] = await Promise.all([
          obtenerTorneo(id),
          listarInscripciones(id).catch(() => []),
        ]);
        setTorneo(t?.torneo ?? t);
        setInscripciones(Array.isArray(ins) ? ins : ins?.inscripciones ?? ins?.data ?? []);
      } catch (e) {
        setError(e.message ?? 'Error al cargar el torneo');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

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
            {torneo.fecha_inicio && (
              <span className="detalle-torneo__meta-item">
                {formatFecha(torneo.fecha_inicio)}
                {torneo.fecha_inicio && ` · ${formatHora(torneo.fecha_inicio)}`}
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
                  to={`/perfil/${torneo.organizador?.id ?? torneo.tienda?.id}`}
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

        {/* Inscripción — placeholder reservado (reemplazado en Commit 3) */}
        <section className="detalle-torneo__section detalle-torneo__section--inscripcion" id="inscripcion">
          <h2 className="detalle-torneo__section-title">Inscripción</h2>
          <div className="detalle-torneo__inscripcion-placeholder">
            <p className="detalle-torneo__placeholder-text">Próximamente: inscripción en línea</p>
          </div>
        </section>

        {/* Inscritos */}
        <section className="detalle-torneo__section">
          <h2 className="detalle-torneo__section-title">
            Inscritos ({inscripciones.length})
          </h2>
          <ListaInscritos inscripciones={inscripciones} editable={false} />
        </section>

        {/* Rondas — placeholder reservado para Persona B */}
        <section className="detalle-torneo__section detalle-torneo__section--rondas">
          <h2 className="detalle-torneo__section-title">Rondas</h2>
          <div className="detalle-torneo__rondas-placeholder">
            <p className="detalle-torneo__placeholder-text">
              Las rondas aparecerán cuando el torneo inicie.
            </p>
          </div>
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
