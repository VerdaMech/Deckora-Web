import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, BarChart3, Calendar } from 'lucide-react';

import { Spinner, Alert, EmptyState, Tooltip } from '@/components/ui';
import { FormatBadge, DeckList } from '@/components/domain';
import { obtenerMazo } from '@/services/mazos.service';
import { relativeDate } from '@/utils/formatters';

import './DetalleMazo.css';

export default function DetalleMazo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mazo, setMazo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  function cargar() {
    setCargando(true);
    setError(null);
    obtenerMazo(id)
      .then((data) => setMazo(data?.mazo ?? data))
      .catch((err) => setError(err.message ?? 'Error al cargar el mazo'))
      .finally(() => setCargando(false));
  }

  useEffect(() => { cargar(); }, [id]);

  const updatedAt = mazo?.updatedAt ?? mazo?.updated_at ?? mazo?.createdAt ?? mazo?.created_at;
  const autor = mazo?.usuario?.nombre_usuario ?? mazo?.autor ?? null;

  return (
    <div className="detalle-mazo">
      <div className="detalle-mazo__header">
        <button
          className="btn btn--ghost btn--sm detalle-mazo__back"
          type="button"
          onClick={() => navigate('/mazos')}
          aria-label="Volver a mis mazos"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {!cargando && mazo && (
          <div className="detalle-mazo__meta">
            <div className="detalle-mazo__titulo-row">
              <h1 className="detalle-mazo__titulo font-h2">{mazo.nombre}</h1>
              <FormatBadge formato={mazo.formato} />

              <Tooltip content="Disponible próximamente" placement="top">
                <button
                  className="btn btn--ghost btn--sm detalle-mazo__editar-btn"
                  type="button"
                  disabled
                  aria-label="Editar mazo (próximamente)"
                >
                  <Pencil size={16} />
                  Editar
                </button>
              </Tooltip>
            </div>

            <div className="detalle-mazo__submeta">
              {autor && (
                <span className="detalle-mazo__autor">por {autor}</span>
              )}
              {updatedAt && (
                <span className="detalle-mazo__fecha">
                  <Calendar size={12} />
                  {relativeDate(updatedAt)}
                </span>
              )}
            </div>

            {mazo.descripcion && (
              <p className="detalle-mazo__descripcion font-body">{mazo.descripcion}</p>
            )}
          </div>
        )}
      </div>

      {cargando && (
        <div className="detalle-mazo__loading">
          <Spinner />
        </div>
      )}

      {error && !cargando && (
        <Alert variant="danger">
          {error}
          <button
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={cargar}
          >
            Reintentar
          </button>
        </Alert>
      )}

      {!cargando && !error && mazo && (
        <div className="detalle-mazo__layout">
          <div className="detalle-mazo__col-lista">
            <DeckList
              cartas={mazo.cartas ?? []}
              comandanteId={mazo.comandanteId ?? mazo.comandante_id}
              editable={false}
            />
          </div>

          <aside className="detalle-mazo__col-stats">
            <div className="detalle-mazo__stats-placeholder">
              <EmptyState
                icon={BarChart3}
                title="Estadísticas próximamente"
                description="Curva de maná, distribución de colores y más."
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
