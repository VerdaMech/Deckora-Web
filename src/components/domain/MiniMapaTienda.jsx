import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const storeIcon = new L.DivIcon({
  html: '<div class="mini-mapa-pin"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MiniMapaTienda({ tienda }) {
  const lat = tienda?.latitud ?? -33.4489;
  const lng = tienda?.longitud ?? -70.6693;
  const center = [lat, lng];

  return (
    <div className="mini-mapa-tienda">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl
        className="mini-mapa-tienda__map"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap contributors © CARTO"
          subdomains="abcd"
          maxZoom={18}
        />
        <Marker position={center} icon={storeIcon} />
      </MapContainer>
    </div>
  );
}
