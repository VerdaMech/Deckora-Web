import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Link } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Crosshair, MapPin } from 'lucide-react';

import { useGeolocation } from '@/hooks/useGeolocation';
import { EmptyState } from '@/components/ui';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@/styles/components/StorePin.css';
import '@/styles/components/MapaTiendas.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.setTelemetryEnabled?.(false);

const CENTER_DEFAULT = [-70.6693, -33.4489];

export default function MapaTiendas({
  tiendas = [],
  center = CENTER_DEFAULT,
  zoom = 6,
  alto = '500px',
  onPinClick,
  pinActivoId = null,
  mostrarBotonGeo = true,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const popupsRef = useRef([]);
  const { coords, loading: geoLoading, requestLocation } = useGeolocation();

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: Array.isArray(center) ? center : [center.longitude, center.latitude],
      zoom,
      minZoom: 4,
      maxZoom: 18,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    popupsRef.current.forEach((p) => p.remove());
    markersRef.current = [];
    popupsRef.current = [];

    tiendas.forEach((tienda) => {
      const lat = tienda.latitud ?? tienda.lat;
      const lng = tienda.longitud ?? tienda.lng;
      if (lat == null || lng == null) return;

      const el = document.createElement('div');
      el.className = `store-pin${tienda.id === pinActivoId ? ' store-pin--active' : ''}`;
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({ offset: 25, className: 'mapa-tiendas__popup-wrapper' })
        .setHTML(`<div id="popup-${tienda.id}"></div>`);

      popup.on('open', () => {
        const container = document.getElementById(`popup-${tienda.id}`);
        if (!container) return;
        const root = createRoot(container);
        root.render(
          <>
            <p className="mapa-tiendas__popup-title">{tienda.nombre ?? tienda.nombre_tienda}</p>
            {tienda.direccion && <p className="mapa-tiendas__popup-direccion">{tienda.direccion}</p>}
            {tienda.nombre_usuario && (
              <a href={`/u/${tienda.nombre_usuario}`} className="mapa-tiendas__popup-link">
                Ver tienda
              </a>
            )}
          </>
        );
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      el.addEventListener('click', () => onPinClick?.(tienda));
      markersRef.current.push(marker);
      popupsRef.current.push(popup);
    });
  }, [tiendas, pinActivoId, onPinClick]);

  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 12 });
    }
  }, [coords]);

  return (
    <div className="mapa-tiendas" style={{ '--mapa-alto': alto }}>
      <div ref={containerRef} className="mapa-tiendas__map" style={{ height: alto }} />

      {mostrarBotonGeo && (
        <button
          className="mapa-tiendas__geo-btn"
          onClick={requestLocation}
          disabled={geoLoading}
          aria-label="Mi ubicación"
        >
          <Crosshair size={18} />
        </button>
      )}

      {tiendas.length === 0 && (
        <div className="mapa-tiendas__empty">
          <EmptyState icon={MapPin} title="No hay tiendas para mostrar" />
        </div>
      )}
    </div>
  );
}
