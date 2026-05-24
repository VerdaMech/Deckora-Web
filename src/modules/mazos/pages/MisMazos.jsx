import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, Calendar, Trash2 } from 'lucide-react';

import { Spinner, Alert, EmptyState, Modal } from '@/components/ui';
import { FormatBadge } from '@/components/domain';
import { listarMisMazos, eliminarMazo } from '@/services/mazos.service';
import { relativeDate } from '@/utils/formatters';
import { CrearMazoModal } from './CrearMazoModal';

import './MisMazos.css';

function MazoCard({ mazo, onClick, onEliminar }) {
  const totalCartas = Number(mazo.total_cartas ?? mazo.totalCartas ?? mazo.cartas?.length ?? 0);
  const comandante = mazo.comandante ?? null;
  const updatedAt = mazo.updatedAt ?? mazo.updated_at ?? mazo.createdAt ?? mazo.created_at;

  function handleEliminar(e) {
    e.stopPropagation();
    onEliminar(mazo);
  }

  return (
    <article
      className="mazo-card card card--interactive"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Ver mazo ${mazo.nombre}`}
    >
      <div className="mazo-card__header">
        <h2 className="mazo-card__nombre font-h4">{mazo.nombre}</h2>
        <FormatBadge formato={mazo.formato} />
      </div>

      {comandante && (
        <div className="mazo-card__comandante">
          <Layers size={14} className="mazo-card__cmdr-icon" />
          <span className="mazo-card__cmdr-nombre">
            {comandante.name ?? comandante.nombre ?? '—'}
          </span>
        </div>
      )}

      <div className="mazo-card__footer">
        <span className="mazo-card__conteo">
          {totalCartas} carta{totalCartas !== 1 ? 's' : ''}
        </span>
        {updatedAt && (
          <span className="mazo-card__fecha">
            <Calendar size={12} />
            {relativeDate(updatedAt)}
          </span>
        )}
        <button
          className="btn btn--ghost btn--sm mazo-card__btn-eliminar"
          type="button"
          onClick={handleEliminar}
          aria-label={`Eliminar mazo ${mazo.nombre}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}

function ModalConfirmarEliminar({ mazo, onConfirmar, onCancelar, cargando }) {
  return (
    <Modal
      show={!!mazo}
      onHide={onCancelar}
      title="¿Eliminar mazo?"
      size="sm"
      footer={
        <div className="mis-mazos__confirmar-acciones">
          <button
            className="btn btn--ghost btn--md"
            type="button"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            className="btn btn--danger btn--md"
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      }
    >
      <p className="mis-mazos__confirmar-desc">
        Vas a eliminar <strong>{mazo?.nombre}</strong>. Esta acción no se puede deshacer.
      </p>
    </Modal>
  );
}

export default function MisMazos() {
  const navigate = useNavigate();
  const [mazos, setMazos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [coldStart, setColdStart] = useState(false);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mazoAEliminar, setMazoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const coldTimer = useRef(null);

  function cargar() {
    setCargando(true);
    setColdStart(false);
    setError(null);
    clearTimeout(coldTimer.current);
    coldTimer.current = setTimeout(() => setColdStart(true), 3000);
    listarMisMazos()
      .then((data) => {
        const lista = Array.isArray(data) ? data : (data?.mazos ?? data?.data ?? []);
        setMazos(lista);
      })
      .catch((err) => setError(err.message ?? 'Error al cargar los mazos'))
      .finally(() => { setCargando(false); setColdStart(false); clearTimeout(coldTimer.current); });
  }

  useEffect(() => { cargar(); return () => clearTimeout(coldTimer.current); }, []);

  function handleMazoCreado() {
    setModalAbierto(false);
    cargar();
  }

  async function handleConfirmarEliminar() {
    if (!mazoAEliminar) return;
    setEliminando(true);
    try {
      await eliminarMazo(mazoAEliminar.id);
      setMazos((prev) => prev.filter((m) => m.id !== mazoAEliminar.id));
      setMazoAEliminar(null);
    } catch {
      setError('No se pudo eliminar el mazo. Intenta de nuevo.');
      setMazoAEliminar(null);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="mis-mazos">
      <div className="mis-mazos__header">
        <h1 className="mis-mazos__titulo font-h2">Mis mazos</h1>
        <button
          className="btn btn--primary btn--md mis-mazos__crear-btn"
          type="button"
          onClick={() => setModalAbierto(true)}
        >
          <Plus size={16} />
          Crear mazo
        </button>
      </div>

      {cargando && (
        <div className="mis-mazos__loading">
          <Spinner mostrarColdStart={coldStart} />
        </div>
      )}

      {error && !cargando && (
        <Alert variant="danger">
          {error}
          <button
            className="btn btn--ghost btn--sm mis-mazos__retry"
            type="button"
            onClick={cargar}
          >
            Reintentar
          </button>
        </Alert>
      )}

      {!cargando && !error && mazos.length === 0 && (
        <EmptyState
          icon={Layers}
          title="Aún no tienes mazos"
          description="Crea tu primer mazo Commander para empezar a armar tu estrategia."
          action={
            <button
              className="btn btn--primary btn--md"
              type="button"
              onClick={() => setModalAbierto(true)}
            >
              Crear mazo
            </button>
          }
        />
      )}

      {!cargando && !error && mazos.length > 0 && (
        <div className="mis-mazos__grid">
          {mazos.map((mazo) => (
            <MazoCard
              key={mazo.id}
              mazo={mazo}
              onClick={() => navigate(`/mazos/${mazo.id}`)}
              onEliminar={setMazoAEliminar}
            />
          ))}
        </div>
      )}

      <CrearMazoModal
        show={modalAbierto}
        onHide={() => setModalAbierto(false)}
        onCreado={handleMazoCreado}
      />

      <ModalConfirmarEliminar
        mazo={mazoAEliminar}
        onConfirmar={handleConfirmarEliminar}
        onCancelar={() => setMazoAEliminar(null)}
        cargando={eliminando}
      />
    </div>
  );
}
