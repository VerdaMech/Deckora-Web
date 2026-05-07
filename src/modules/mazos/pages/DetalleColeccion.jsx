import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Spinner, Alert } from '@/components/ui';
import {
  obtenerMiColeccion,
  agregarCartaAColeccion,
  actualizarCartaEnColeccion,
  eliminarCartaDeColeccion,
} from '@/services/colecciones.service';
import { BarraAgregarCarta } from '../components/BarraAgregarCarta';
import { ColeccionEditor } from '../components/ColeccionEditor';

import './DetalleColeccion.css';

export default function DetalleColeccion() {
  const navigate = useNavigate();

  const [coleccion, setColeccion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    obtenerMiColeccion()
      .then((data) => setColeccion(data))
      .catch((err) => setError(err.message ?? 'Error al cargar la colección'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleAgregar(carta) {
    try {
      await agregarCartaAColeccion({ scryfall_id: carta.id ?? carta.scryfall_id, cantidad: 1, es_foil: false });
      cargar();
    } catch (err) {
      setError(err.message ?? 'Error al agregar la carta');
    }
  }

  async function handleCantidadChange(entrada, nuevaCantidad) {
    try {
      await actualizarCartaEnColeccion(entrada.id, { cantidad: nuevaCantidad, es_foil: entrada.es_foil ?? false });
      setColeccion((prev) => ({
        ...prev,
        cartas: prev.cartas.map((e) =>
          e.id === entrada.id ? { ...e, cantidad: nuevaCantidad } : e
        ),
      }));
    } catch (err) {
      setError(err.message ?? 'Error al actualizar la cantidad');
    }
  }

  async function handleFoilChange(entrada, es_foil) {
    try {
      await actualizarCartaEnColeccion(entrada.id, { cantidad: entrada.cantidad, es_foil });
      setColeccion((prev) => ({
        ...prev,
        cartas: prev.cartas.map((e) =>
          e.id === entrada.id ? { ...e, es_foil } : e
        ),
      }));
    } catch (err) {
      setError(err.message ?? 'Error al actualizar foil');
    }
  }

  async function handleEliminar(entrada) {
    try {
      await eliminarCartaDeColeccion(entrada.id);
      setColeccion((prev) => ({
        ...prev,
        cartas: prev.cartas.filter((e) => e.id !== entrada.id),
        totalCartas: (prev.totalCartas ?? prev.cartas.length) - (entrada.cantidad ?? 1),
      }));
    } catch (err) {
      setError(err.message ?? 'Error al eliminar la carta');
    }
  }

  const totalCartas = coleccion?.totalCartas ?? coleccion?.cartas?.length ?? 0;

  return (
    <div className="detalle-coleccion">
      <div className="detalle-coleccion__header">
        <button
          className="btn btn--ghost btn--sm detalle-coleccion__back"
          type="button"
          onClick={() => navigate('/colecciones')}
          aria-label="Volver a mis colecciones"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <div className="detalle-coleccion__titulo-wrap">
          <h1 className="detalle-coleccion__titulo font-h2">Mi colección</h1>
          {!cargando && coleccion && (
            <span className="detalle-coleccion__contador font-small">
              {totalCartas} carta{totalCartas !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="detalle-coleccion__error">
          {error}
        </Alert>
      )}

      {cargando ? (
        <div className="detalle-coleccion__loading">
          <Spinner />
        </div>
      ) : !coleccion ? null : (
        <div className="detalle-coleccion__tab-content">
          <BarraAgregarCarta onAgregar={handleAgregar} />
          <div className="detalle-coleccion__lista">
            <ColeccionEditor
              coleccion={coleccion.cartas ?? []}
              onCantidadChange={handleCantidadChange}
              onFoilChange={handleFoilChange}
              onEliminar={handleEliminar}
            />
          </div>
        </div>
      )}
    </div>
  );
}
