// TODO: eliminar después de Commit B3 (integración de MapaTiendas en Landing)
import { useEffect, useState } from 'react';

import MapaTiendas from '@/components/domain/MapaTiendas';
import { Spinner, Alert } from '@/components/ui';
import { listarTiendas } from '@/services/tiendas.service';
import '@/styles/components/DemoMapa.css';

export default function DemoMapa() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarTiendas().then(({ data, error: err }) => {
      if (err) {
        // Fallback mockeado si la API falla (cold start de Render)
        setTiendas([
          { id: 1, nombre: 'Tienda del Dragón', direccion: 'Av. Providencia 1234, Santiago', lat: -33.4327, lng: -70.6094, username: 'tienda-dragon' },
          { id: 2, nombre: 'La Mazmorra', direccion: 'Av. Irarrázaval 3456, Ñuñoa', lat: -33.4569, lng: -70.6059, username: 'la-mazmorra' },
          { id: 3, nombre: 'Arena MTG', direccion: 'Av. Las Condes 9876, Las Condes', lat: -33.4030, lng: -70.5755, username: 'arena-mtg' },
        ]);
        setError(null);
      } else {
        setTiendas(data ?? []);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="demo-mapa__loading">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="demo-mapa container">
      <h1 className="demo-mapa__titulo">Demo — Mapa de Tiendas</h1>
      <p className="demo-mapa__nota">
        Vista de desarrollo. Se eliminará en Commit B3 cuando se integre en Landing.
      </p>
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      <MapaTiendas tiendas={tiendas} alto="600px" />
    </div>
  );
}
