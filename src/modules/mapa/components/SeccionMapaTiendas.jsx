import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

import MapaTiendas from '@/components/domain/MapaTiendas';
import { Spinner, Alert } from '@/components/ui';
import { listarTiendas } from '@/services/tiendas.service';
import './SeccionMapaTiendas.css';

export default function SeccionMapaTiendas() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function cargar() {
    setError(null);
    setLoading(true);
    listarTiendas()
      .then(({ data, error: err }) => {
        if (err) {
          setError(err);
        } else {
          setTiendas(data ?? []);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <section className="seccion-mapa-tiendas">
      <div className="seccion-mapa-tiendas__contenido">
        <div className="seccion-mapa-tiendas__header">
          <MapPin size={20} className="seccion-mapa-tiendas__header-icono" aria-hidden="true" />
          <h2 className="seccion-mapa-tiendas__titulo">Tiendas en tu zona</h2>
        </div>
        <div className="seccion-mapa-tiendas__separador" aria-hidden="true" />
        <p className="seccion-mapa-tiendas__subtitulo">
          Encuentra eventos y comunidad cerca de ti.
        </p>

        <div className="seccion-mapa-tiendas__mapa">
          {loading ? (
            <div className="seccion-mapa-tiendas__loading">
              <Spinner size="lg" />
              <span className="seccion-mapa-tiendas__loading-texto">
                Cargando mapa de tiendas...
              </span>
            </div>
          ) : error ? (
            <Alert variant="warning" className="seccion-mapa-tiendas__error">
              No se pudieron cargar las tiendas. Intenta más tarde.
              <button className="seccion-mapa-tiendas__reintentar" onClick={cargar}>
                Reintentar
              </button>
            </Alert>
          ) : (
            <MapaTiendas tiendas={tiendas} alto="500px" />
          )}
        </div>

        {!loading && !error && (
          <p className="seccion-mapa-tiendas__footer">
            {tiendas.length} {tiendas.length === 1 ? 'tienda registrada' : 'tiendas registradas'}
          </p>
        )}
      </div>
    </section>
  );
}
