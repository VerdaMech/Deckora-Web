import { useState } from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';

import { Modal } from '@/components/ui';
import { MTGCard, ManaCost } from '@/components/domain';

import './ColeccionEditor.css';

export function ColeccionEditor({ coleccion = [], onCantidadChange, onFoilChange, onEliminar }) {
  const [pendienteEliminar, setPendienteEliminar] = useState(null);

  if (!coleccion.length) {
    return (
      <div className="coleccion-editor coleccion-editor--empty">
        <p className="coleccion-editor__empty-text">
          Tu colección está vacía. Buscá una carta arriba para empezar.
        </p>
      </div>
    );
  }

  function confirmarEliminar(entrada) {
    setPendienteEliminar(entrada);
  }

  function cancelarEliminar() {
    setPendienteEliminar(null);
  }

  function ejecutarEliminar() {
    if (pendienteEliminar) {
      onEliminar?.(pendienteEliminar);
    }
    setPendienteEliminar(null);
  }

  return (
    <>
      <div className="coleccion-editor">
        {coleccion.map((entrada) => {
          const carta = entrada.carta ?? entrada;
          const nombre = carta?.name ?? carta?.nombre ?? '—';
          const manaCost = carta?.mana_cost ?? carta?.manaCost ?? '';
          const id = entrada.id ?? entrada.scryfallId;

          return (
            <div key={id} className="coleccion-editor__entrada">
              <div className="coleccion-editor__card-wrap">
                <MTGCard carta={carta} variant="thumbnail" />
              </div>

              <div className="coleccion-editor__info">
                <span className="coleccion-editor__nombre">{nombre}</span>
                {manaCost && <ManaCost cost={manaCost} />}
              </div>

              <div className="coleccion-editor__controles">
                <label className="coleccion-editor__foil-label">
                  <input
                    type="checkbox"
                    className="coleccion-editor__foil-check"
                    checked={!!entrada.foil}
                    onChange={(e) => onFoilChange?.(entrada, e.target.checked)}
                  />
                  <span className="coleccion-editor__foil-text">Foil</span>
                </label>

                <div className="coleccion-editor__stepper">
                  <button
                    className="coleccion-editor__stepper-btn"
                    type="button"
                    onClick={() =>
                      onCantidadChange?.(entrada, Math.max(1, (entrada.cantidad ?? 1) - 1))
                    }
                    disabled={(entrada.cantidad ?? 1) <= 1}
                    aria-label="Reducir cantidad"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="coleccion-editor__cantidad">{entrada.cantidad ?? 1}</span>
                  <button
                    className="coleccion-editor__stepper-btn"
                    type="button"
                    onClick={() =>
                      onCantidadChange?.(entrada, Math.min(99, (entrada.cantidad ?? 1) + 1))
                    }
                    disabled={(entrada.cantidad ?? 1) >= 99}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  className="coleccion-editor__btn-eliminar"
                  type="button"
                  onClick={() => confirmarEliminar(entrada)}
                  aria-label={`Eliminar ${nombre}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        show={!!pendienteEliminar}
        onHide={cancelarEliminar}
        title="Eliminar carta"
        footer={
          <div className="coleccion-editor__modal-footer">
            <button
              className="btn btn--secondary btn--sm"
              type="button"
              onClick={cancelarEliminar}
            >
              Cancelar
            </button>
            <button
              className="btn btn--danger btn--sm"
              type="button"
              onClick={ejecutarEliminar}
            >
              Eliminar
            </button>
          </div>
        }
      >
        <p className="coleccion-editor__modal-texto">
          ¿Eliminar{' '}
          <strong>
            {(pendienteEliminar?.carta ?? pendienteEliminar)?.name ??
              (pendienteEliminar?.carta ?? pendienteEliminar)?.nombre ??
              'esta carta'}
          </strong>{' '}
          de tu colección?
        </p>
      </Modal>
    </>
  );
}

export default ColeccionEditor;
