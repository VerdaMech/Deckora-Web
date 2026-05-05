import { Minus, Plus, Trash2 } from 'lucide-react';

import { agruparPorTipo } from '@/utils/deck-helpers';
import { MTGCard } from './MTGCard';
import { ManaCost } from './ManaCost';
import { CommanderBadge } from './CommanderBadge';

import './DeckList.css';

const GRUPO_LABELS = {
  comandante: 'Comandante',
  criaturas: 'Criaturas',
  tierras: 'Tierras',
  instantaneos: 'Instantáneos',
  conjuros: 'Conjuros',
  artefactos: 'Artefactos',
  encantamientos: 'Encantamientos',
  planeswalkers: 'Planeswalkers',
  otros: 'Otros',
};

const GRUPO_ORDER = [
  'comandante',
  'criaturas',
  'tierras',
  'instantaneos',
  'conjuros',
  'artefactos',
  'encantamientos',
  'planeswalkers',
  'otros',
];

function GrupoHeader({ label, count }) {
  return (
    <div className="deck-list__group-header">
      <span className="deck-list__group-label">{label}</span>
      <span className="deck-list__group-count">{count}</span>
    </div>
  );
}

function EntradaCarta({
  entrada,
  esComandante,
  onCartaClick,
  editable,
  onCantidadChange,
  onEliminar,
  onMarcarComandante,
}) {
  const carta = entrada.carta ?? entrada;
  const nombre = carta?.name ?? carta?.nombre ?? '—';
  const manaCost = carta?.mana_cost ?? carta?.manaCost ?? '';

  return (
    <div className={`deck-list__entrada${esComandante ? ' deck-list__entrada--commander' : ''}`}>
      <div
        className="deck-list__entrada-info"
        onClick={onCartaClick ? () => onCartaClick(entrada) : undefined}
        role={onCartaClick ? 'button' : undefined}
        tabIndex={onCartaClick ? 0 : undefined}
        onKeyDown={onCartaClick ? (e) => {
          if (e.key === 'Enter') onCartaClick(entrada);
        } : undefined}
      >
        <MTGCard carta={carta} variant="thumbnail" esComandante={esComandante} />
        <div className="deck-list__entrada-texto">
          <span className="deck-list__carta-nombre">{nombre}</span>
          {manaCost && <ManaCost cost={manaCost} />}
          {esComandante && (
            <div className="deck-list__cmdr-badge">
              <CommanderBadge />
            </div>
          )}
        </div>
      </div>

      {editable ? (
        <div className="deck-list__controles">
          {!esComandante && onMarcarComandante && (
            <button
              className="deck-list__btn-cmdr"
              onClick={() => onMarcarComandante(entrada)}
              title="Marcar como comandante"
              type="button"
            >
              ★
            </button>
          )}
          <div className="deck-list__stepper">
            <button
              className="deck-list__stepper-btn"
              type="button"
              onClick={() => onCantidadChange?.(entrada, Math.max(1, (entrada.cantidad ?? 1) - 1))}
              disabled={(entrada.cantidad ?? 1) <= 1}
              aria-label="Reducir cantidad"
            >
              <Minus size={12} />
            </button>
            <span className="deck-list__cantidad">{entrada.cantidad ?? 1}</span>
            <button
              className="deck-list__stepper-btn"
              type="button"
              onClick={() => onCantidadChange?.(entrada, (entrada.cantidad ?? 1) + 1)}
              aria-label="Aumentar cantidad"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            className="deck-list__btn-eliminar"
            type="button"
            onClick={() => onEliminar?.(entrada)}
            aria-label="Eliminar carta"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <span className="deck-list__cantidad-ro">×{entrada.cantidad ?? 1}</span>
      )}
    </div>
  );
}

export function DeckList({
  cartas = [],
  comandanteId,
  onCartaClick,
  editable = false,
  onCantidadChange,
  onEliminar,
  onMarcarComandante,
}) {
  if (!cartas.length) {
    return (
      <div className="deck-list deck-list--empty">
        <p className="deck-list__empty-text">Este mazo no tiene cartas aún.</p>
      </div>
    );
  }

  const grupos = agruparPorTipo(cartas);

  return (
    <div className="deck-list">
      {GRUPO_ORDER.map((key) => {
        const entradas = grupos[key];
        if (!entradas.length) return null;

        const totalCantidad = entradas.reduce((s, e) => s + (e.cantidad ?? 1), 0);

        return (
          <div key={key} className="deck-list__group">
            <GrupoHeader label={GRUPO_LABELS[key]} count={totalCantidad} />
            <div className="deck-list__group-entradas">
              {entradas.map((entrada, i) => {
                const cartaId = entrada.id ?? entrada.scryfallId ?? i;
                const esComandante =
                  entrada.esComandante ||
                  (comandanteId && (entrada.id === comandanteId || entrada.scryfallId === comandanteId));

                return (
                  <EntradaCarta
                    key={cartaId}
                    entrada={entrada}
                    esComandante={!!esComandante}
                    onCartaClick={onCartaClick}
                    editable={editable}
                    onCantidadChange={onCantidadChange}
                    onEliminar={onEliminar}
                    onMarcarComandante={onMarcarComandante}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DeckList;
