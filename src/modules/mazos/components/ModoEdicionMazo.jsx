import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Search, Upload, X } from 'lucide-react';

import { Modal } from '@/components/ui';
import { DeckBuilder } from '@/components/domain';
import { BarraAgregarCarta } from './BarraAgregarCarta';
import { ImportarMazoModal } from './ImportarMazoModal';
import {
  agregarCartaAMazo,
  actualizarCartaEnMazo,
  eliminarCartaDeMazo,
  validarMazo,
  autocompletarMazo,
  obtenerMazo,
  getRecomendaciones,
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
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
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

    const esCommander = mazo?.formato?.toUpperCase() === 'COMMANDER';
    const typeLine = (carta?.type_line ?? carta?.tipo ?? '').toLowerCase();
    const esTierraBasica = typeLine.includes('basic') && typeLine.includes('land');

    if (esCommander && !esTierraBasica) {
      const existente = cartas.find((e) => (e.scryfallId ?? e.id) === entrada.scryfallId);
      if (existente) {
        mostrarToast('En Commander cada carta solo puede aparecer una vez.');
        return;
      }
    }

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

  async function handleDesmarcarComandante(entrada) {
    const entradaId = entrada.scryfallId ?? entrada.id;

    setComandanteId(null);
    setCartas((prev) =>
      prev.map((e) => ({ ...e, esComandante: false })),
    );

    try {
      await actualizarCartaEnMazo(mazo.id, entradaId, { esComandante: false });
    } catch {
      setComandanteId(entradaId);
      setCartas((prev) =>
        prev.map((e) => ({
          ...e,
          esComandante: (e.scryfallId ?? e.id) === entradaId,
        })),
      );
      mostrarToast('No se pudo quitar el comandante. Verifica tu conexión.');
    }
  }

  function parsearCartas(raw) {
    return (raw?.MazoCartas ?? raw?.cartas ?? []).map((mc) =>
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
  }

  function contarTotal(lista) {
    return lista.reduce((s, c) => s + (c.cantidad ?? 1), 0);
  }

  async function handleAutocompletar() {
    const limite = mazo?.formato?.toUpperCase() === 'COMMANDER' ? 100 : 60;

    // Fase 1: llamar a autocompletar hasta 5 veces en segundo plano
    let nuevasCartas = cartas;
    for (let intento = 0; intento < 5; intento++) {
      await autocompletarMazo(mazo.id);
      const data = await obtenerMazo(mazo.id);
      nuevasCartas = parsearCartas(data?.mazo ?? data);
      if (contarTotal(nuevasCartas) >= limite) break;
    }

    // Fase 2: recortar sobrantes hasta el límite exacto
    let exceso = contarTotal(nuevasCartas) - limite;
    if (exceso > 0) {
      const candidatas = [...nuevasCartas].filter((c) => !c.esComandante).reverse();
      for (const carta of candidatas) {
        if (exceso <= 0) break;
        const id = carta.scryfallId ?? carta.id;
        const cantidad = carta.cantidad ?? 1;
        if (cantidad <= exceso) {
          await eliminarCartaDeMazo(mazo.id, id);
          nuevasCartas = nuevasCartas.filter((c) => (c.scryfallId ?? c.id) !== id);
          exceso -= cantidad;
        } else {
          const nuevaCantidad = cantidad - exceso;
          await actualizarCartaEnMazo(mazo.id, id, { cantidad: nuevaCantidad });
          nuevasCartas = nuevasCartas.map((c) =>
            (c.scryfallId ?? c.id) === id ? { ...c, cantidad: nuevaCantidad } : c,
          );
          exceso = 0;
        }
      }
    }

    // Fase 3: si aún faltan cartas, completar con recomendaciones
    let faltantes = limite - contarTotal(nuevasCartas);
    if (faltantes > 0) {
      try {
        const recsData = await getRecomendaciones(mazo.id);
        const recs = recsData.recomendaciones ?? [];
        const idsEnMazo = new Set(nuevasCartas.map((c) => c.scryfallId ?? c.id));

        for (const rec of recs) {
          if (faltantes <= 0) break;
          const recId = rec.scryfall_id ?? rec.id;
          if (idsEnMazo.has(recId)) continue;

          await agregarCartaAMazo(mazo.id, { scryfallId: recId, cantidad: 1, esComandante: false });
          nuevasCartas = [
            ...nuevasCartas,
            { id: rec.id, scryfallId: recId, cantidad: 1, esComandante: false, carta: rec },
          ];
          idsEnMazo.add(recId);
          faltantes--;
        }
      } catch {
        // best-effort: si las recomendaciones fallan, se queda con lo que tiene
      }
    }

    // Actualizar la UI una sola vez con el resultado final
    setCartas(nuevasCartas);

    const totalFinal = contarTotal(nuevasCartas);
    if (totalFinal !== limite) {
      mostrarToast(
        `El mazo quedó con ${totalFinal}/${limite} cartas. Intenta autocompletar de nuevo.`,
        'warning',
      );
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
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={() => setModalImportarAbierto(true)}
            aria-label="Importar lista"
          >
            <Upload size={16} />
            Importar lista
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
        onDesmarcarComandante={handleDesmarcarComandante}
        onAplicarSugerencia={handleAgregarCarta}
        onAutocompletar={handleAutocompletar}
      />

      <Modal
        show={modalBuscarAbierto}
        onHide={() => setModalBuscarAbierto(false)}
        title="Buscar carta"
        size="md"
      >
        <BarraAgregarCarta onAgregar={handleAgregarCarta} modoPanel />
      </Modal>

      <ImportarMazoModal
        show={modalImportarAbierto}
        mazoId={mazo.id}
        onHide={() => setModalImportarAbierto(false)}
        onImportado={() => {
          setModalImportarAbierto(false);
          onSalir();
        }}
      />

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
