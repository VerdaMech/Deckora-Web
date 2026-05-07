import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import { Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
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
  const { mostrarExito, mostrarError } = useToast();
  const [nombreTienda, setNombreTienda] = useState(perfil?.nombre_tienda ?? '');
  const [direccion, setDireccion] = useState(perfil?.direccion ?? '');
  const [telefono, setTelefono] = useState(perfil?.numero_telefono ?? '');
  const [horario, setHorario] = useState(perfil?.horario_apertura ?? '');
  const [pos, setPos] = useState([
    perfil?.latitud ?? -33.4489,
    perfil?.longitud ?? -70.6693,
  ]);
  const [loading, setLoading] = useState(false);
  const [nombreError, setNombreError] = useState('');

  function handleMapClick(latlng) {
    setPos([latlng.lat, latlng.lng]);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setNombreError('');
    if (!nombreTienda.trim()) {
      setNombreError('El nombre de la tienda es obligatorio.');
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
      mostrarExito('Tienda actualizada', 'Los datos de tu tienda se guardaron correctamente.');
    } catch (err) {
      mostrarError('No se pudo guardar', traducirError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="config-section">
      <h2 className="config-section__title">Configuración de tienda</h2>
      <form onSubmit={handleGuardar} className="config-form">
        <Input
          label="Nombre de la tienda"
          value={nombreTienda}
          onChange={(e) => setNombreTienda(e.target.value)}
          error={nombreError}
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
          <p className="config-section__warning">Haz clic en el mapa para fijar la ubicación.</p>
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
        </div>

        <Button type="submit" variant="primary" loading={loading}>
          Guardar
        </Button>
      </form>
    </div>
  );
}
