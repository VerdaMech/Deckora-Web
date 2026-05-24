import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Calendar, Layers } from 'lucide-react';

import { Spinner, Alert, Tooltip, EmptyState, Modal } from '@/components/ui';
import { FormatBadge, DeckList, DeckStats, ManaCost, OracleText } from '@/components/domain';
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
  const [cartaZoom, setCartaZoom] = useState(null);

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
        const comandanteId = cartas.find((c) => c.esComandante)?.scryfallId ?? null;
        setMazo({ ...raw, cartas, comandanteId });
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  <span className="detalle-mazo__panel-meta-label">Público</span>
                  <label className="detalle-mazo__switch">
                    <input
                      id="mazo-publico-edit"
                      type="checkbox"
                      checked={publicoEdit}
                      onChange={(e) => setPublicoEdit(e.target.checked)}
                      disabled={guardando}
                    />
                    <span className="detalle-mazo__switch-track">
                      <span className="detalle-mazo__switch-thumb" />
                    </span>
                    <span className="detalle-mazo__switch-label">
                      {publicoEdit ? 'Visible para todos' : 'Solo tú'}
                    </span>
                  </label>
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
                onCartaClick={(entrada) => setCartaZoom(entrada)}
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
      <Modal
        show={!!cartaZoom}
        onHide={() => setCartaZoom(null)}
        title={cartaZoom?.carta?.nombre ?? cartaZoom?.carta?.name ?? ''}
        size="lg"
      >
        {cartaZoom && (() => {
          const carta = cartaZoom.carta ?? cartaZoom;
          const nombre = carta.nombre ?? carta.name ?? '—';
          const tipo = carta.tipo ?? carta.type_line ?? '';
          const manaCost = carta.costo_mana ?? carta.mana_cost ?? '';
          const texto = carta.texto ?? carta.oracle_text ?? '';
          const tienePT = carta.fuerza != null && carta.resistencia != null;
          return (
            <div className="detalle-mazo__zoom">
              <div className="detalle-mazo__zoom-imagen">
                {carta.imagen_url ? (
                  <img
                    src={carta.imagen_url}
                    alt={nombre}
                    className="detalle-mazo__zoom-img"
                  />
                ) : (
                  <div className="detalle-mazo__zoom-placeholder">{nombre}</div>
                )}
              </div>
              <div className="detalle-mazo__zoom-info">
                {(tipo || manaCost) && (
                  <div className="detalle-mazo__zoom-tipo-row">
                    {tipo && <span className="detalle-mazo__zoom-tipo">{tipo}</span>}
                    {manaCost && <ManaCost cost={manaCost} />}
                  </div>
                )}
                {texto && (
                  <OracleText text={texto} className="detalle-mazo__zoom-texto" />
                )}
                {tienePT && (
                  <p className="detalle-mazo__zoom-pt">{carta.fuerza} / {carta.resistencia}</p>
                )}
                {cartaZoom.esComandante && (
                  <span className="detalle-mazo__zoom-cmdr">Comandante</span>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
