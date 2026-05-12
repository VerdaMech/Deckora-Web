import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { MTGCard } from '@/components/domain';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { listarCartas, listarSets } from '@/services/biblioteca.service';

import './Biblioteca.css';

const LIMIT = 50;

function adaptarCarta(carta) {
  return {
    ...carta,
    name: carta.nombre,
    image_uris: { normal: carta.imagen_url, small: carta.imagen_url },
  };
}

function getPaginas(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = [1];
  if (actual > 3) paginas.push('...');
  const desde = Math.max(2, actual - 1);
  const hasta = Math.min(total - 1, actual + 1);
  for (let i = desde; i <= hasta; i++) paginas.push(i);
  if (actual < total - 2) paginas.push('...');
  paginas.push(total);
  return paginas;
}

export default function Biblioteca() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const setCodigo = searchParams.get('set_codigo') ?? '';

  const [cartas, setCartas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [sets, setSets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cartaZoom, setCartaZoom] = useState(null);

  useEffect(() => {
    listarSets()
      .then((res) => setSets(res?.data ?? []))
      .catch(() => setSets([]));
  }, []);

  const cargarCartas = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await listarCartas({ page, limit: LIMIT, set_codigo: setCodigo || undefined });
      setCartas(res?.data ?? []);
      setPagination(res?.pagination ?? null);
    } catch (err) {
      setError(err.message ?? 'Error al cargar las cartas');
      setCartas([]);
    } finally {
      setCargando(false);
    }
  }, [page, setCodigo]);

  useEffect(() => {
    cargarCartas();
  }, [cargarCartas]);

  function handleSetChange(e) {
    const value = e.target.value;
    setSearchParams(value ? { set_codigo: value, page: '1' } : { page: '1' });
  }

  function handlePagina(nuevaPagina) {
    const params = {};
    if (setCodigo) params.set_codigo = setCodigo;
    params.page = String(nuevaPagina);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const inicio = pagination ? (page - 1) * LIMIT + 1 : 0;
  const fin = pagination ? Math.min(page * LIMIT, pagination.total) : 0;

  return (
    <div className="biblioteca">
      <div className="biblioteca__header">
        <h1 className="biblioteca__titulo">Biblioteca</h1>
        <div className="biblioteca__filtros">
          <select
            className="biblioteca__select form-select"
            value={setCodigo}
            onChange={handleSetChange}
            aria-label="Filtrar por set"
          >
            <option value="">Todos los sets</option>
            {sets.map(({ anio, sets: grupo }) => (
              <optgroup key={anio} label={String(anio || 'Sin fecha')}>
                {grupo.map((s) => (
                  <option key={s.codigo} value={s.codigo}>
                    {s.nombre ?? s.codigo} ({s.cantidad_cartas})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <Alert variant="danger">
          {error}{' '}
          <button className="btn btn--ghost btn--sm" onClick={cargarCartas}>
            Reintentar
          </button>
        </Alert>
      )}

      {cargando ? (
        <div className="biblioteca__grid">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="biblioteca__skeleton" height="180px" radius="var(--radius-lg)" />
          ))}
        </div>
      ) : !error && cartas.length === 0 ? (
        <EmptyState
          title="Sin cartas"
          description="No hay cartas para el set seleccionado."
        />
      ) : !error && (
        <div className="biblioteca__grid">
          {cartas.map((carta) => (
            <MTGCard
              key={carta.id}
              carta={adaptarCarta(carta)}
              variant="thumbnail"
              onClick={() => setCartaZoom(carta)}
            />
          ))}
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <div className="biblioteca__footer">
          <p className="biblioteca__contador">
            Mostrando {inicio}–{fin} de {pagination.total.toLocaleString('es-CL')} cartas
          </p>
          {pagination.total_pages > 1 && (
            <nav className="biblioteca__paginacion" aria-label="Paginación">
              <button
                className="btn btn--ghost btn--sm biblioteca__pag-btn"
                onClick={() => handlePagina(page - 1)}
                disabled={page <= 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>

              {getPaginas(page, pagination.total_pages).map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="biblioteca__pag-ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    className={`btn btn--sm biblioteca__pag-btn${p === page ? ' biblioteca__pag-btn--activo' : ' btn--ghost'}`}
                    onClick={() => handlePagina(p)}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="btn btn--ghost btn--sm biblioteca__pag-btn"
                onClick={() => handlePagina(page + 1)}
                disabled={page >= pagination.total_pages}
                aria-label="Página siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </div>
      )}

      <Modal
        show={!!cartaZoom}
        onHide={() => setCartaZoom(null)}
        title={cartaZoom?.nombre ?? ''}
        size="md"
      >
        <div className="biblioteca__zoom">
          {cartaZoom?.imagen_url ? (
            <img
              src={cartaZoom.imagen_url}
              alt={cartaZoom.nombre}
              className="biblioteca__zoom-img"
            />
          ) : (
            <div className="biblioteca__zoom-placeholder">{cartaZoom?.nombre}</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
