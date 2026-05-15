import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Search, X } from 'lucide-react';

import { Modal } from '@/components/ui';
import { DeckBuilder } from '@/components/domain';
import { BarraAgregarCarta } from './BarraAgregarCarta';
import {
  agregarCartaAMazo,
  actualizarCartaEnMazo,
  eliminarCartaDeMazo,
  validarMazo,
} from '@/services/mazos.service';

import './ModoEdicionMazo.css';

function Toast({ mensaje, variant = 'danger', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`modo-edicion__toast modo-edicion__toast--${variant}`} role="alert">
      <span>{mensaje}</span>
      <button type="button" className="modo-edicion__toast-cerrar" onClick={onClose} aria-label="Cerrar">
        <X size={14} />
      </button>
    </div>
  );
}

export function ModoEdicionMazo({ mazo, onSalir }) {
  const [cartas, setCartas] = useState(mazo?.cartas ?? []);
  const [comandanteId, setComandanteId] = useState(mazo?.comandanteId ?? mazo?.comandante_id ?? null);
  const [validacion, setValidacion] = useState(null);
  const [validacionCargando, setValidacionCargando] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalBuscarAbierto, setModalBuscarAbierto] = useState(false);
  const validacionTimer = useRef(null);

  const mostrarToast = useCallback((mensaje, variant = 'danger') => {
    setToast({ mensaje, variant, id: Date.now() });
  }, []);

  const dispararValidacion = useCallback(() => {
    clearTimeout(validacionTimer.current);
    validacionTimer.current = setTimeout(async () => {
      setValidacionCargando(true);
      try {
        const resultado = await validarMazo(mazo.id);
        setValidacion(resultado);
      } catch {
        // La validación es best-effort; no bloqueamos la edición si falla
      } finally {
        setValidacionCargando(false);
      }
    }, 500);
  }, [mazo.id]);

  useEffect(() => {
    dispararValidacion();
    return () => clearTimeout(validacionTimer.current);
  }, [cartas, dispararValidacion]);

  async function handleAgregarCarta(carta) {
    const entrada = {
      id: carta.id,
      scryfallId: carta.scryfall_id ?? carta.id,
      cantidad: 1,
      esComandante: false,
      carta,
    };

    setCartas((prev) => {
      const existente = prev.find((e) => (e.scryfallId ?? e.id) === entrada.scryfallId);
      if (existente) {
        return prev.map((e) =>
          (e.scryfallId ?? e.id) === entrada.scryfallId
            ? { ...e, cantidad: (e.cantidad ?? 1) + 1 }
            : e,
        );
      }
      return [...prev, entrada];
    });

    setModalBuscarAbierto(false);

    try {
      await agregarCartaAMazo(mazo.id, { scryfallId: entrada.scryfallId, cantidad: 1, esComandante: false });
    } catch {
      setCartas((prev) => {
        const existente = mazo.cartas?.find((e) => (e.scryfallId ?? e.id) === entrada.scryfallId);
        if (existente) {
          return prev.map((e) =>
            (e.scryfallId ?? e.id) === entrada.scryfallId
              ? { ...e, cantidad: e.cantidad - 1 }
              : e,
          ).filter((e) => (e.cantidad ?? 1) > 0);
        }
        return prev.filter((e) => (e.scryfallId ?? e.id) !== entrada.scryfallId);
      });
      mostrarToast('No se pudo agregar la carta. Verifica tu conexión.');
    }
  }

  async function handleCantidadChange(entrada, nuevaCantidad) {
    const entradaId = entrada.scryfallId ?? entrada.id;
    const cantidadAnterior = entrada.cantidad ?? 1;

    setCartas((prev) =>
      prev.map((e) => ((e.scryfallId ?? e.id) === entradaId ? { ...e, cantidad: nuevaCantidad } : e)),
    );

    try {
      await actualizarCartaEnMazo(mazo.id, entradaId, { cantidad: nuevaCantidad });
    } catch {
      setCartas((prev) =>
        prev.map((e) => ((e.scryfallId ?? e.id) === entradaId ? { ...e, cantidad: cantidadAnterior } : e)),
      );
      mostrarToast('No se pudo actualizar la cantidad. Verifica tu conexión.');
    }
  }

  async function handleEliminar(entrada) {
    const entradaId = entrada.scryfallId ?? entrada.id;
    const snapshot = [...cartas];

    setCartas((prev) => prev.filter((e) => (e.scryfallId ?? e.id) !== entradaId));

    try {
      await eliminarCartaDeMazo(mazo.id, entradaId);
    } catch {
      setCartas(snapshot);
      mostrarToast('No se pudo eliminar la carta. Verifica tu conexión.');
    }
  }

  async function handleMarcarComandante(entrada) {
    const entradaId = entrada.scryfallId ?? entrada.id;
    const anteriorComandanteId = comandanteId;

    setComandanteId(entradaId);
    setCartas((prev) =>
      prev.map((e) => ({
        ...e,
        esComandante: (e.scryfallId ?? e.id) === entradaId,
      })),
    );

    try {
      if (anteriorComandanteId && anteriorComandanteId !== entradaId) {
        await actualizarCartaEnMazo(mazo.id, anteriorComandanteId, { esComandante: false });
      }
      await actualizarCartaEnMazo(mazo.id, entradaId, { esComandante: true });
    } catch {
      setComandanteId(anteriorComandanteId);
      setCartas((prev) =>
        prev.map((e) => ({
          ...e,
          esComandante: (e.scryfallId ?? e.id) === anteriorComandanteId,
        })),
      );
      mostrarToast('No se pudo asignar el comandante. Verifica tu conexión.');
    }
  }

  return (
    <div className="modo-edicion">
      <div className="modo-edicion__toolbar">
        <span className="modo-edicion__toolbar-label">Modo edición</span>
        <div className="modo-edicion__toolbar-acciones">
          <button
            className="btn btn--ghost btn--sm modo-edicion__btn-buscar-mobile"
            type="button"
            onClick={() => setModalBuscarAbierto(true)}
            aria-label="Buscar carta"
          >
            <Search size={16} />
            Buscar carta
          </button>
          <button
            className="btn btn--primary btn--sm"
            type="button"
            onClick={onSalir}
          >
            <Check size={16} />
            Confirmar edición
          </button>
          <button
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={onSalir}
          >
            <X size={16} />
            Salir de edición
          </button>
        </div>
      </div>

      <DeckBuilder
        mazo={mazo}
        cartas={cartas}
        validacion={validacion}
        validacionCargando={validacionCargando}
        comandanteId={comandanteId}
        onAgregarCarta={handleAgregarCarta}
        onCantidadChange={handleCantidadChange}
        onEliminar={handleEliminar}
        onMarcarComandante={handleMarcarComandante}
        onAplicarSugerencia={handleAgregarCarta}
      />

      <Modal
        show={modalBuscarAbierto}
        onHide={() => setModalBuscarAbierto(false)}
        title="Buscar carta"
        size="md"
      >
        <BarraAgregarCarta onAgregar={handleAgregarCarta} />
      </Modal>

      {toast && (
        <Toast
          key={toast.id}
          mensaje={toast.mensaje}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default ModoEdicionMazo;
