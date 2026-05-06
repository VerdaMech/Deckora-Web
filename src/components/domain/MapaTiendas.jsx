import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Crosshair, Plus, Minus, MapPin } from 'lucide-react';

import { crearStorePinIcon } from './StorePin';
import { useGeolocation } from '@/hooks/useGeolocation';
import { EmptyState } from '@/components/ui';

// leaflet/dist/leaflet.css se importa una sola vez en main.jsx para evitar duplicados
import '@/styles/components/StorePin.css';
import '@/styles/components/MapaTiendas.css';

const TILES_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const CENTER_DEFAULT = [-33.4489, -70.6693];

function ZoomControles() {
  const map = useMap();
  return (
    <div className="mapa-tiendas__zoom-controles">
      <button className="mapa-tiendas__zoom-btn" onClick={() => map.zoomIn()} aria-label="Acercar">
        <Plus size={16} />
      </button>
      <button className="mapa-tiendas__zoom-btn" onClick={() => map.zoomOut()} aria-label="Alejar">
        <Minus size={16} />
      </button>
    </div>
  );
}

function BtnGeolocalizacion() {
  const map = useMap();
  const { coords, loading, requestLocation } = useGeolocation();

  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 12);
  }, [coords, map]);

  return (
    <button
      className="mapa-tiendas__geo-btn"
      onClick={requestLocation}
      disabled={loading}
      aria-label="Mi ubicación"
    >
      <Crosshair size={18} />
    </button>
  );
}

export default function MapaTiendas({
  tiendas = [],
  center = CENTER_DEFAULT,
  zoom = 6,
  alto = '500px',
  onPinClick,
  pinActivoId = null,
  mostrarBotonGeo = true,
}) {
  return (
    <div className="mapa-tiendas" style={{ '--mapa-alto': alto }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="mapa-tiendas__map"
        zoomControl={false}
        minZoom={4}
        maxZoom={18}
      >
        <TileLayer
          url={TILES_URL}
          attribution={ATTRIBUTION}
          subdomains="abcd"
          maxZoom={18}
        />

        {tiendas.map((tienda) => (
          <Marker
            key={tienda.id}
            position={[tienda.lat, tienda.lng]}
            icon={crearStorePinIcon({ activo: tienda.id === pinActivoId })}
            eventHandlers={{ click: () => onPinClick?.(tienda) }}
          >
            <Popup className="mapa-tiendas__popup">
              <p className="mapa-tiendas__popup-title">{tienda.nombre}</p>
              {tienda.direccion && (
                <p className="mapa-tiendas__popup-direccion">{tienda.direccion}</p>
              )}
              {tienda.username && (
                <Link to={`/u/${tienda.username}`} className="mapa-tiendas__popup-link">
                  Ver tienda
                </Link>
              )}
            </Popup>
          </Marker>
        ))}

        <ZoomControles />
        {mostrarBotonGeo && <BtnGeolocalizacion />}
      </MapContainer>

      {tiendas.length === 0 && (
        <div className="mapa-tiendas__empty">
          <EmptyState icon={MapPin} title="No hay tiendas para mostrar" />
        </div>
      )}
    </div>
  );
}
