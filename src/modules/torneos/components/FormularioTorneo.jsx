import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Button, Input, Select, Textarea, Alert } from '@/components/ui';
import { FORMATO_LABELS } from '@/utils/constants';
import './FormularioTorneo.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const FORMATO_OPCIONES = Object.entries(FORMATO_LABELS).map(([value, label]) => ({ value, label }));
const DEFAULT_LAT = -33.4489;
const DEFAULT_LNG = -70.6693;

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
  const [lat, setLat] = useState(torneoInicial?.latitud ?? DEFAULT_LAT);
  const [lng, setLng] = useState(torneoInicial?.longitud ?? DEFAULT_LNG);
  const [cupoMax, setCupoMax] = useState(torneoInicial?.cupo_maximo ?? '');
  const [precio, setPrecio] = useState(torneoInicial?.precio ?? 0);
  const [publico, setPublico] = useState(torneoInicial?.publico ?? true);
  const [errores, setErrores] = useState({});
  const [errorSubmit, setErrorSubmit] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocodeTimer = useRef(null);
  const latRef = useRef(lat);
  const lngRef = useRef(lng);

  useEffect(() => { latRef.current = lat; }, [lat]);
  useEffect(() => { lngRef.current = lng; }, [lng]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lngRef.current, latRef.current],
      zoom: 13,
      scrollZoom: false,
    });

    const el = document.createElement('div');
    el.className = 'formulario-torneo__pin';
    markerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
      .setLngLat([lngRef.current, latRef.current])
      .addTo(mapRef.current);

    markerRef.current.on('dragend', () => {
      const pos = markerRef.current.getLngLat();
      setLat(parseFloat(pos.lat.toFixed(6)));
      setLng(parseFloat(pos.lng.toFixed(6)));
    });

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  function moveMarkerTo(newLng, newLat) {
    setLat(newLat);
    setLng(newLng);
    markerRef.current?.setLngLat([newLng, newLat]);
    mapRef.current?.flyTo({ center: [newLng, newLat], zoom: 14 });
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      moveMarkerTo(
        parseFloat(pos.coords.longitude.toFixed(6)),
        parseFloat(pos.coords.latitude.toFixed(6))
      );
    });
  }

  function handleUbicacionChange(valor) {
    setUbicacion(valor);
    clearTimeout(geocodeTimer.current);
    if (valor.length < 3) { setSugerencias([]); return; }
    geocodeTimer.current = setTimeout(async () => {
      setBuscandoDireccion(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(valor)}.json?country=cl&language=es&limit=5&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
        );
        const data = await res.json();
        setSugerencias(data.features ?? []);
      } catch { setSugerencias([]); }
      finally { setBuscandoDireccion(false); }
    }, 400);
  }

  function seleccionarSugerencia(feature) {
    const [lo, la] = feature.center;
    moveMarkerTo(parseFloat(lo.toFixed(6)), parseFloat(la.toFixed(6)));
    setUbicacion(feature.place_name);
    setSugerencias([]);
  }

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
        latitud: lat,
        longitud: lng,
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

      <div className="form-field formulario-torneo__campo-ubicacion">
        <label className="form-label">
          Ubicación <span className="form-required" aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          className={`form-input${errores.ubicacion ? ' form-input--error' : ''}`}
          value={ubicacion}
          onChange={(e) => handleUbicacionChange(e.target.value)}
          placeholder="Busca una dirección..."
          autoComplete="off"
        />
        {errores.ubicacion && <p className="form-helper form-helper--error" role="alert">{errores.ubicacion}</p>}
        {sugerencias.length > 0 && (
          <ul className="formulario-torneo__sugerencias">
            {sugerencias.map((f) => (
              <li key={f.id} className="formulario-torneo__sugerencia" onClick={() => seleccionarSugerencia(f)}>
                {f.place_name}
              </li>
            ))}
          </ul>
        )}
        {buscandoDireccion && <p className="form-helper">Buscando...</p>}
      </div>

      <div className="form-field formulario-torneo__campo-mapa">
        <label className="form-label">Ubicación en el mapa</label>
        <div className="formulario-torneo__coords-row">
          <Button type="button" variant="ghost" size="sm" onClick={usarMiUbicacion}>
            Usar mi ubicación
          </Button>
        </div>
        <div className="formulario-torneo__mapa-wrapper">
          <div ref={containerRef} className="formulario-torneo__mapa" />
        </div>
        <p className="formulario-torneo__mapa-ayuda">
          Arrastra el pin para ajustar la ubicación exacta.
        </p>
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
