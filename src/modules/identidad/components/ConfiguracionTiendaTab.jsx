import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import { Input, Button, Alert } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { actualizarMiTienda } from '@/services/tiendas.service';

const editIcon = new L.DivIcon({
  html: '<div class="mini-mapa-pin"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function ConfiguracionTiendaTab() {
  const { user, perfil } = useAuth();
  const [nombreTienda, setNombreTienda] = useState(perfil?.nombre_tienda ?? '');
  const [direccion, setDireccion] = useState(perfil?.direccion ?? '');
  const [telefono, setTelefono] = useState(perfil?.numero_telefono ?? '');
  const [horario, setHorario] = useState(perfil?.horario_apertura ?? '');
  const [pos, setPos] = useState([
    perfil?.latitud ?? -33.4489,
    perfil?.longitud ?? -70.6693,
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  function handleMapClick(latlng) {
    setPos([latlng.lat, latlng.lng]);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    setExito('');
    if (!nombreTienda.trim()) {
      setError('El nombre de la tienda es obligatorio.');
      return;
    }
    setLoading(true);
    try {
      await actualizarMiTienda(user?.id, {
        nombre_tienda: nombreTienda,
        direccion,
        numero_telefono: telefono,
        horario_apertura: horario,
        latitud: pos[0],
        longitud: pos[1],
      });
      setExito('Datos de la tienda actualizados.');
    } catch (err) {
      setError(err.message ?? 'Error al guardar los datos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="config-section">
      <h2 className="config-section__title">Configuración de tienda</h2>
      <form onSubmit={handleGuardar} className="config-form">
        {error && <Alert variant="danger">{error}</Alert>}
        {exito && <Alert variant="success">{exito}</Alert>}
        <Input
          label="Nombre de la tienda"
          value={nombreTienda}
          onChange={(e) => setNombreTienda(e.target.value)}
          required
        />
        <Input
          label="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
        <Input
          label="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <Input
          label="Horario"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          placeholder="Ej: Lun-Vie 10-20, Sáb 11-15"
        />

        <div>
          <p className="form-label">Ubicación</p>
          <p className="config-section__warning">Hacé clic en el mapa para fijar la ubicación.</p>
          <div className="config-tienda__map-edit">
            <MapContainer
              center={pos}
              zoom={13}
              scrollWheelZoom={false}
              className="config-tienda__map-inner"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="© OpenStreetMap contributors © CARTO"
                subdomains="abcd"
                maxZoom={18}
              />
              <MapClickHandler onMapClick={handleMapClick} />
              <Marker position={pos} icon={editIcon} />
            </MapContainer>
          </div>
          <div className="config-tienda__coords">
            <Input label="Latitud" value={pos[0].toFixed(6)} readOnly />
            <Input label="Longitud" value={pos[1].toFixed(6)} readOnly />
          </div>
        </div>

        <Button type="submit" variant="primary" loading={loading}>
          Guardar
        </Button>
      </form>
    </div>
  );
}
