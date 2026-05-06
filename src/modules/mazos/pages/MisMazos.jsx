import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, Calendar } from 'lucide-react';

import { Spinner, Alert, EmptyState } from '@/components/ui';
import { FormatBadge } from '@/components/domain';
import { listarMisMazos } from '@/services/mazos.service';
import { relativeDate } from '@/utils/formatters';
import { CrearMazoModal } from './CrearMazoModal';

import './MisMazos.css';

function MazoCard({ mazo, onClick }) {
  const totalCartas = mazo.totalCartas ?? mazo.cartas?.length ?? 0;
  const comandante = mazo.comandante ?? null;
  const updatedAt = mazo.updatedAt ?? mazo.updated_at ?? mazo.createdAt ?? mazo.created_at;

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
      </div>
    </article>
  );
}

export default function MisMazos() {
  const navigate = useNavigate();
  const [mazos, setMazos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [coldStart, setColdStart] = useState(false);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
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
          title="Aún no tenés mazos"
          description="Creá tu primer mazo y empezá a armar tu estrategia."
          action={
            <button
              className="btn btn--primary btn--md"
              type="button"
              onClick={() => setModalAbierto(true)}
            >
              Crear tu primer mazo
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
            />
          ))}
        </div>
      )}

      <CrearMazoModal
        show={modalAbierto}
        onHide={() => setModalAbierto(false)}
        onCreado={handleMazoCreado}
      />
    </div>
  );
}
