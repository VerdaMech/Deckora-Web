import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Button, Input, Select, Textarea, Alert } from '@/components/ui';
import { FORMATO_LABELS } from '@/utils/constants';
import './FormularioTorneo.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const FORMATO_OPCIONES = Object.entries(FORMATO_LABELS).map(([value, label]) => ({ value, label }));

const DEFAULT_LAT = -33.4489;
const DEFAULT_LNG = -70.6693;
const GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export default function FormularioTorneo({
  torneoInicial,
  onSubmit,
  submitting = false,
  submitLabel = 'Guardar',
}) {
  const [nombre, setNombre] = useState(torneoInicial?.nombre ?? '');
  const [formato, setFormato] = useState(torneoInicial?.formato ?? 'COMMANDER');
  const [descripcion, setDescripcion] = useState(torneoInicial?.descripcion ?? '');
  const [fechaInicio, setFechaInicio] = useState(
    torneoInicial?.fecha
      ? new Date(torneoInicial.fecha).toISOString().slice(0, 16)
      : ''
  );
  const [ubicacion, setUbicacion] = useState(torneoInicial?.ubicacion ?? '');
  const [cupoMax, setCupoMax] = useState(torneoInicial?.cupo_maximo ?? '');
  const [precio, setPrecio] = useState(torneoInicial?.precio ?? 0);
  const [publico, setPublico] = useState(torneoInicial?.publico ?? true);
  const [errores, setErrores] = useState({});
  const [errorSubmit, setErrorSubmit] = useState(null);

  const [sugerencias, setSugerencias] = useState([]);

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocodeTimer = useRef(null);

  function moveMarkerTo(newLng, newLat) {
    markerRef.current?.setLngLat([newLng, newLat]);
    mapRef.current?.flyTo({ center: [newLng, newLat], zoom: 14 });
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      moveMarkerTo(longitude, latitude);
      try {
        const res = await fetch(
          `${GEOCODE_URL}/${longitude},${latitude}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&language=es&limit=1`
        );
        const data = await res.json();
        if (data.features?.[0]) setUbicacion(data.features[0].place_name);
      } catch { /* el reverse-geocode es best-effort */ }
    });
  }

  function handleUbicacionChange(e) {
    const val = e.target.value;
    setUbicacion(val);
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
    setUbicacion(feature.place_name);
    setSugerencias([]);
    const [featureLng, featureLat] = feature.center;
    moveMarkerTo(featureLng, featureLat);
  }

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let mounted = true;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [DEFAULT_LNG, DEFAULT_LAT],
      zoom: 13,
    });

    const el = document.createElement('div');
    el.className = 'mini-mapa-pin';
    markerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
      .setLngLat([DEFAULT_LNG, DEFAULT_LAT])
      .addTo(mapRef.current);

    if (torneoInicial?.ubicacion) {
      fetch(
        `${GEOCODE_URL}/${encodeURIComponent(torneoInicial.ubicacion)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&language=es&country=cl&limit=1`
      )
        .then((r) => r.json())
        .then((data) => {
          if (!mounted || !data.features?.[0]) return;
          const [fLng, fLat] = data.features[0].center;
          markerRef.current?.setLngLat([fLng, fLat]);
          mapRef.current?.flyTo({ center: [fLng, fLat], zoom: 14 });
        })
        .catch(() => {});
    }

    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validar() {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    else if (nombre.trim().length > 80) e.nombre = 'Máximo 80 caracteres';
    if (!fechaInicio) e.fechaInicio = 'La fecha de inicio es requerida';
    if (!ubicacion.trim()) e.ubicacion = 'La ubicación es requerida';
    const cupoNum = Number(cupoMax);
    if (cupoMax !== '' && (isNaN(cupoNum) || cupoNum < 4)) e.cupoMax = 'El cupo mínimo es 4 jugadores';
    const precioNum = parseInt(precio, 10);
    if (isNaN(precioNum) || precioNum < 0) e.precio = 'El precio no puede ser negativo';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validaciones = validar();
    if (Object.keys(validaciones).length > 0) { setErrores(validaciones); return; }
    setErrores({});
    setErrorSubmit(null);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        formato,
        descripcion: descripcion.trim() || null,
        fecha: new Date(fechaInicio).toISOString(),
        ubicacion: ubicacion.trim(),
        cupo_maximo: cupoMax !== '' ? parseInt(cupoMax, 10) : null,
        precio: parseInt(precio, 10),
        publico,
      });
    } catch (err) {
      setErrorSubmit(err.message ?? 'Error al guardar el torneo');
    }
  }

  return (
    <form className="formulario-torneo" onSubmit={handleSubmit} noValidate>
      {errorSubmit && <Alert variant="danger" className="formulario-torneo__submit-error">{errorSubmit}</Alert>}

      <Input
        label="Nombre"
        required
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        maxLength={80}
        placeholder="Nombre del torneo"
        error={errores.nombre}
      />

      <div className="form-field">
        <label className="form-label">Formato</label>
        <Select value={formato} onChange={(e) => setFormato(e.target.value)} options={FORMATO_OPCIONES} />
      </div>

      <Textarea
        label="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción opcional del torneo..."
        rows={3}
      />

      <div className="form-field">
        <label className="form-label" htmlFor="ft-fecha-inicio">
          Fecha de inicio <span className="form-required" aria-hidden="true">*</span>
        </label>
        <input
          id="ft-fecha-inicio"
          type="datetime-local"
          className={`form-input${errores.fechaInicio ? ' form-input--error' : ''}`}
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          aria-required="true"
        />
        {errores.fechaInicio && <p className="form-helper form-helper--error" role="alert">{errores.fechaInicio}</p>}
      </div>

      <div className="form-field">
        <label className="form-label">
          Ubicación <span className="form-required" aria-hidden="true">*</span>
        </label>
        <div className="formulario-torneo__ubicacion-wrapper">
          <input
            type="text"
            className={`form-input${errores.ubicacion ? ' form-input--error' : ''}`}
            value={ubicacion}
            onChange={handleUbicacionChange}
            placeholder="Ej: Av. Providencia 1234, Santiago"
            autoComplete="off"
          />
          {sugerencias.length > 0 && (
            <ul className="formulario-torneo__sugerencias">
              {sugerencias.map((f) => (
                <li
                  key={f.id}
                  className="formulario-torneo__sugerencia-item"
                  onMouseDown={() => seleccionarSugerencia(f)}
                >
                  {f.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {errores.ubicacion && <p className="form-helper form-helper--error" role="alert">{errores.ubicacion}</p>}
        <button type="button" className="formulario-torneo__usar-ubicacion" onClick={usarMiUbicacion}>
          Usar mi ubicación
        </button>
      </div>

      <div className="formulario-torneo__mapa">
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="formulario-torneo__fila-2">
        <div className="form-field">
          <label className="form-label">Cupo máximo</label>
          <input
            type="number"
            className={`form-input${errores.cupoMax ? ' form-input--error' : ''}`}
            value={cupoMax}
            onChange={(e) => setCupoMax(e.target.value)}
            min={4}
            placeholder="Sin límite"
          />
          {errores.cupoMax && <p className="form-helper form-helper--error">{errores.cupoMax}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Precio de inscripción (CLP)</label>
          <input
            type="number"
            className={`form-input${errores.precio ? ' form-input--error' : ''}`}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            min={0}
            step="1"
          />
          {errores.precio && <p className="form-helper form-helper--error">{errores.precio}</p>}
        </div>
      </div>

      <div className="formulario-torneo__toggle-row">
        <span className="formulario-torneo__toggle-label">Torneo público</span>
        <button
          type="button"
          role="switch"
          aria-checked={publico}
          className={`formulario-torneo__toggle${publico ? ' formulario-torneo__toggle--on' : ''}`}
          onClick={() => setPublico((v) => !v)}
        >
          <span className="formulario-torneo__toggle-thumb" />
        </button>
        <span className="formulario-torneo__toggle-desc">
          {publico ? 'Visible para todos' : 'Solo por invitación'}
        </span>
      </div>

      <div className="formulario-torneo__actions">
        <Button type="submit" variant="primary" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
