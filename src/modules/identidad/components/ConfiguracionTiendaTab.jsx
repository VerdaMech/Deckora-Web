import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@/styles/components/StorePin.css';

import { Input, Button, Alert } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
import { actualizarMiTienda, listarTiendas } from '@/services/tiendas.service';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_LAT = -33.4489;
const DEFAULT_LNG = -70.6693;
const GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export default function ConfiguracionTiendaTab() {
  const { user, perfil } = useAuth();
  const { mostrarExito, mostrarError } = useToast();
  const [nombreTienda, setNombreTienda] = useState(perfil?.nombre_tienda ?? '');
  const [direccion, setDireccion] = useState(perfil?.direccion ?? '');
  const [telefono, setTelefono] = useState(perfil?.numero_telefono ?? '');
  const [horario, setHorario] = useState(perfil?.horario_apertura ?? '');
  const [lat, setLat] = useState(perfil?.latitud ?? DEFAULT_LAT);
  const [lng, setLng] = useState(perfil?.longitud ?? DEFAULT_LNG);
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nombreError, setNombreError] = useState('');
  const [feedbackGuardado, setFeedbackGuardado] = useState(null);

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocodeTimer = useRef(null);

  function moveMarkerTo(newLng, newLat) {
    markerRef.current?.setLngLat([newLng, newLat]);
    mapRef.current?.flyTo({ center: [newLng, newLat], zoom: 15 });
    setLat(newLat);
    setLng(newLng);
  }

  async function reversGeocode(newLng, newLat) {
    try {
      const res = await fetch(
        `${GEOCODE_URL}/${newLng},${newLat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&language=es&limit=1`
      );
      const data = await res.json();
      if (data.features?.[0]) setDireccion(data.features[0].place_name);
    } catch {}
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      moveMarkerTo(longitude, latitude);
      await reversGeocode(longitude, latitude);
    });
  }

  function handleDireccionChange(e) {
    const val = e.target.value;
    setDireccion(val);
    setSugerencias([]);
    clearTimeout(geocodeTimer.current);
    if (!val.trim() || val.length < 3) return;
    geocodeTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${GEOCODE_URL}/${encodeURIComponent(val)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&language=es&country=cl&limit=5`
        );
        const data = await res.json();
        setSugerencias(data.features ?? []);
      } catch {
        setSugerencias([]);
      }
    }, 350);
  }

  function seleccionarSugerencia(feature) {
    const [fLng, fLat] = feature.center;
    setDireccion(feature.place_name);
    setSugerencias([]);
    moveMarkerTo(fLng, fLat);
  }

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let mounted = true;

    const initLat = perfil?.latitud ?? DEFAULT_LAT;
    const initLng = perfil?.longitud ?? DEFAULT_LNG;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [initLng, initLat],
      zoom: 13,
    });

    const el = document.createElement('div');
    el.className = 'store-pin';
    markerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
      .setLngLat([initLng, initLat])
      .addTo(mapRef.current);

    markerRef.current.on('dragend', () => {
      const pos = markerRef.current.getLngLat();
      const newLat = parseFloat(pos.lat.toFixed(6));
      const newLng = parseFloat(pos.lng.toFixed(6));
      setLat(newLat);
      setLng(newLng);
      reversGeocode(newLng, newLat);
    });

    if (!perfil?.latitud) {
      listarTiendas().then(({ data }) => {
        if (!mounted) return;
        const conCoords = (data ?? []).filter((t) => t.latitud != null && t.longitud != null);
        if (conCoords.length === 0) return;
        const centLat = conCoords.reduce((s, t) => s + t.latitud, 0) / conCoords.length;
        const centLng = conCoords.reduce((s, t) => s + t.longitud, 0) / conCoords.length;
        mapRef.current?.flyTo({ center: [centLng, centLat], zoom: 12 });
      });
    }

    return () => { mounted = false; mapRef.current?.remove(); mapRef.current = null; };
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

        <div className="form-field">
          <label className="form-label">Dirección</label>
          <div className="config-tienda__ubicacion-wrapper">
            <input
              type="text"
              className="form-input"
              value={direccion}
              onChange={handleDireccionChange}
              onBlur={() => setTimeout(() => setSugerencias([]), 150)}
              placeholder="Ej: Av. Providencia 1234, Santiago"
              autoComplete="off"
            />
            {sugerencias.length > 0 && (
              <ul className="config-tienda__sugerencias">
                {sugerencias.map((f) => (
                  <li
                    key={f.id}
                    className="config-tienda__sugerencia-item"
                    onMouseDown={() => seleccionarSugerencia(f)}
                  >
                    {f.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" className="config-tienda__usar-ubicacion" onClick={usarMiUbicacion}>
            Usar mi ubicación
          </button>
        </div>

        <div>
          <p className="config-section__warning">
            Haz clic en el mapa o arrastra el pin para ajustar la ubicación exacta.
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
