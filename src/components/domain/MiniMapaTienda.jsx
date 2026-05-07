import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@/styles/components/mini-mapa.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MiniMapaTienda({ tienda }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const lat = tienda?.latitud ?? -33.4489;
  const lng = tienda?.longitud ?? -70.6693;

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: 15,
      interactive: false,
    });

    const el = document.createElement('div');
    el.className = 'mini-mapa-pin';
    new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(mapRef.current);

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [lat, lng]);

  return (
    <div className="mini-mapa-tienda">
      <div ref={containerRef} className="mini-mapa-tienda__map" />
    </div>
  );
}
