import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Input, Button, Alert } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
import { actualizarMiTienda } from '@/services/tiendas.service';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_LAT = -33.4489;
const DEFAULT_LNG = -70.6693;

export default function ConfiguracionTiendaTab() {
  const { user, perfil } = useAuth();
  const { mostrarExito, mostrarError } = useToast();
  const [nombreTienda, setNombreTienda] = useState(perfil?.nombre_tienda ?? '');
  const [direccion, setDireccion] = useState(perfil?.direccion ?? '');
  const [telefono, setTelefono] = useState(perfil?.numero_telefono ?? '');
  const [horario, setHorario] = useState(perfil?.horario_apertura ?? '');
  const [lat, setLat] = useState(perfil?.latitud ?? DEFAULT_LAT);
  const [lng, setLng] = useState(perfil?.longitud ?? DEFAULT_LNG);
  const [loading, setLoading] = useState(false);
  const [nombreError, setNombreError] = useState('');
  const [feedbackGuardado, setFeedbackGuardado] = useState(null);

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: 13,
    });

    const el = document.createElement('div');
    el.className = 'mini-mapa-pin';
    markerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    markerRef.current.on('dragend', () => {
      const pos = markerRef.current.getLngLat();
      setLat(parseFloat(pos.lat.toFixed(6)));
      setLng(parseFloat(pos.lng.toFixed(6)));
    });

    mapRef.current.on('click', (e) => {
      const newLng = parseFloat(e.lngLat.lng.toFixed(6));
      const newLat = parseFloat(e.lngLat.lat.toFixed(6));
      markerRef.current?.setLngLat([newLng, newLat]);
      setLat(newLat);
      setLng(newLng);
    });

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  async function handleGuardar(e) {
    e.preventDefault();
    setNombreError('');
    setFeedbackGuardado(null);
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
        latitud: lat,
        longitud: lng,
      });
      setFeedbackGuardado({ tipo: 'success', mensaje: 'Los datos de tu tienda se guardaron correctamente.' });
      mostrarExito('Tienda actualizada', 'Los datos de tu tienda se guardaron correctamente.');
    } catch (err) {
      const mensaje = traducirError(err);
      setFeedbackGuardado({ tipo: 'danger', mensaje });
      mostrarError('No se pudo guardar', mensaje);
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
          <p className="config-section__warning">
            Haz clic en el mapa o arrastra el pin para fijar la ubicación.
          </p>
          <div className="config-tienda__map-edit">
            <div ref={containerRef} className="config-tienda__map-inner" />
          </div>
        </div>

        {feedbackGuardado && (
          <Alert variant={feedbackGuardado.tipo}>{feedbackGuardado.mensaje}</Alert>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          Guardar
        </Button>
      </form>
    </div>
  );
}
