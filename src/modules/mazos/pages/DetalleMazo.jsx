import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Calendar, Layers } from 'lucide-react';

import { Spinner, Alert, Tooltip, EmptyState } from '@/components/ui';
import { FormatBadge, DeckList, DeckStats } from '@/components/domain';
import { ModoEdicionMazo } from '@/modules/mazos/components/ModoEdicionMazo';
import { obtenerMazo, validarMazo, actualizarMazo } from '@/services/mazos.service';
import { relativeDate } from '@/utils/formatters';
import { PanelValidacion } from '@/modules/mazos/components/PanelValidacion';
import { useToast } from '@/context/ToastContext';

import './DetalleMazo.css';

export default function DetalleMazo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useToast();

  const [mazo, setMazo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [validacion, setValidacion] = useState(null);
  const [validandoMazo, setValidandoMazo] = useState(false);

  const [nombreEdit, setNombreEdit] = useState('');
  const [publicoEdit, setPublicoEdit] = useState(false);
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    setCargando(true);
    setError(null);
    obtenerMazo(id)
      .then((data) => {
        const raw = data?.mazo ?? data;
        const cartas = (raw?.MazoCartas ?? raw?.cartas ?? []).map((mc) =>
          mc.Carta
            ? {
                id: mc.Carta.id,
                scryfallId: mc.Carta.scryfall_id,
                cantidad: mc.cantidad,
                esComandante: mc.es_comandante,
                carta: mc.Carta,
              }
            : mc,
        );
        setMazo({ ...raw, cartas });
        setNombreEdit(raw?.nombre ?? '');
        setPublicoEdit(raw?.publico ?? false);
        if ((raw?.MazoCartas ?? raw?.cartas ?? []).length > 0) {
          setValidandoMazo(true);
          setValidacion(null);
          validarMazo(id)
            .then((v) => setValidacion(v))
            .catch(() => setValidacion(null))
            .finally(() => setValidandoMazo(false));
        }
      })
      .catch((err) => setError(err.message ?? 'Error al cargar el mazo'))
      .finally(() => setCargando(false));
  }

  useEffect(() => { cargar(); }, [id]);

  async function handleGuardarMeta() {
    setGuardando(true);
    try {
      await actualizarMazo(mazo.id, { nombre: nombreEdit, publico: publicoEdit });
      setMazo((prev) => ({ ...prev, nombre: nombreEdit, publico: publicoEdit }));
      mostrarExito('Mazo actualizado', 'Los cambios se guardaron correctamente.');
    } catch (err) {
      mostrarError('Error al guardar', err?.message ?? 'No se pudieron guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  }

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

              {!modoEdicion && (
                <Tooltip content="Editar mazo" placement="top">
                  <button
                    className="btn btn--ghost btn--sm detalle-mazo__editar-btn"
                    type="button"
                    onClick={() => setModoEdicion(true)}
                    aria-label="Editar mazo"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                </Tooltip>
              )}
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

            {modoEdicion && (
              <div className="detalle-mazo__panel-meta">
                <div className="detalle-mazo__panel-meta-fila">
                  <label className="detalle-mazo__panel-meta-label" htmlFor="mazo-nombre-edit">
                    Nombre
                  </label>
                  <input
                    id="mazo-nombre-edit"
                    className="detalle-mazo__panel-meta-input"
                    type="text"
                    value={nombreEdit}
                    onChange={(e) => setNombreEdit(e.target.value)}
                    disabled={guardando}
                  />
                </div>
                <div className="detalle-mazo__panel-meta-fila">
                  <label className="detalle-mazo__panel-meta-label" htmlFor="mazo-publico-edit">
                    Público
                  </label>
                  <input
                    id="mazo-publico-edit"
                    type="checkbox"
                    checked={publicoEdit}
                    onChange={(e) => setPublicoEdit(e.target.checked)}
                    disabled={guardando}
                  />
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  type="button"
                  onClick={handleGuardarMeta}
                  disabled={guardando}
                >
                  {guardando ? <Spinner size={14} /> : 'Guardar cambios'}
                </button>
              </div>
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
        modoEdicion ? (
          <ModoEdicionMazo
            mazo={mazo}
            onSalir={() => { setModoEdicion(false); cargar(); }}
          />
        ) : (mazo.cartas ?? []).length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Tu mazo está vacío"
            description="Entra al modo edición y empieza a construirlo."
            action={
              <button
                className="btn btn--primary btn--md"
                type="button"
                onClick={() => setModoEdicion(true)}
              >
                Editar mazo
              </button>
            }
          />
        ) : (
          <div className="detalle-mazo__layout">
            <div className="detalle-mazo__col-lista">
              <DeckList
                cartas={mazo.cartas ?? []}
                comandanteId={mazo.comandanteId ?? mazo.comandante_id}
                editable={false}
              />
            </div>

            <aside className="detalle-mazo__col-stats">
              <PanelValidacion
                validacion={validacion}
                formato={mazo.formato}
                totalCartas={(mazo.cartas ?? []).reduce((s, c) => s + (c.cantidad ?? 1), 0)}
                cargando={validandoMazo}
              />
              <DeckStats
                cartas={mazo.cartas ?? []}
                formato={mazo.formato}
                comandanteId={mazo.comandanteId ?? mazo.comandante_id}
              />
            </aside>
          </div>
        )
      )}
    </div>
  );
}
