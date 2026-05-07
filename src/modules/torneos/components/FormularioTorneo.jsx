import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

import { Button, Input, Select, Textarea, Alert } from '@/components/ui';
import { FORMATOS, FORMATO_LABELS } from '@/utils/constants';
import './FormularioTorneo.css';

const FORMATO_OPCIONES = Object.entries(FORMATO_LABELS).map(([value, label]) => ({ value, label }));

const pinIcon = new L.DivIcon({
  html: '<div class="formulario-torneo__pin"></div>',
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapCenterer({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13);
  }, [position, map]);
  return null;
}

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
    torneoInicial?.fecha_inicio
      ? new Date(torneoInicial.fecha_inicio).toISOString().slice(0, 16)
      : ''
  );
  const [ubicacion, setUbicacion] = useState(torneoInicial?.ubicacion ?? '');
  const [lat, setLat] = useState(torneoInicial?.latitud ?? DEFAULT_LAT);
  const [lng, setLng] = useState(torneoInicial?.longitud ?? DEFAULT_LNG);
  const [centerTarget, setCenterTarget] = useState(null);
  const [cupoMax, setCupoMax] = useState(torneoInicial?.cupo_maximo ?? '');
  const [precio, setPrecio] = useState(torneoInicial?.precio ?? 0);
  const [publico, setPublico] = useState(torneoInicial?.publico ?? true);
  const [errores, setErrores] = useState({});
  const [errorSubmit, setErrorSubmit] = useState(null);

  function validar() {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    else if (nombre.trim().length > 80) e.nombre = 'Máximo 80 caracteres';
    if (!fechaInicio) e.fechaInicio = 'La fecha de inicio es requerida';
    if (!ubicacion.trim()) e.ubicacion = 'La ubicación es requerida';
    const cupoNum = Number(cupoMax);
    if (cupoMax !== '' && (isNaN(cupoNum) || cupoNum < 4)) {
      e.cupoMax = 'El cupo mínimo es 4 jugadores';
    }
    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum < 0) e.precio = 'El precio no puede ser negativo';
    return e;
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const la = parseFloat(pos.coords.latitude.toFixed(6));
      const lo = parseFloat(pos.coords.longitude.toFixed(6));
      setLat(la);
      setLng(lo);
      setCenterTarget([la, lo]);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validaciones = validar();
    if (Object.keys(validaciones).length > 0) {
      setErrores(validaciones);
      return;
    }
    setErrores({});
    setErrorSubmit(null);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        formato,
        descripcion: descripcion.trim() || null,
        fecha_inicio: new Date(fechaInicio).toISOString(),
        ubicacion: ubicacion.trim(),
        latitud: parseFloat(lat),
        longitud: parseFloat(lng),
        cupo_maximo: cupoMax !== '' ? parseInt(cupoMax, 10) : null,
        precio: Number(precio),
        publico,
      });
    } catch (err) {
      setErrorSubmit(err.message ?? 'Error al guardar el torneo');
    }
  }

  const markerPos = [
    parseFloat(lat) || DEFAULT_LAT,
    parseFloat(lng) || DEFAULT_LNG,
  ];

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
        <Select
          value={formato}
          onChange={(e) => setFormato(e.target.value)}
          options={FORMATO_OPCIONES}
        />
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
        {errores.fechaInicio && (
          <p className="form-helper form-helper--error" role="alert">{errores.fechaInicio}</p>
        )}
      </div>

      <Input
        label="Ubicación"
        required
        value={ubicacion}
        onChange={(e) => setUbicacion(e.target.value)}
        placeholder="Ej: Providencia, Santiago"
        error={errores.ubicacion}
      />

      <div className="form-field formulario-torneo__campo-mapa">
        <label className="form-label">Ubicación en el mapa</label>
        <div className="formulario-torneo__coords-row">
          <Button type="button" variant="ghost" size="sm" onClick={usarMiUbicacion}>
            Usar mi ubicación
          </Button>
        </div>
        <div className="formulario-torneo__mapa-wrapper">
          <MapContainer
            center={markerPos}
            zoom={13}
            scrollWheelZoom={false}
            className="formulario-torneo__mapa"
            attributionControl
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap contributors © CARTO"
              subdomains="abcd"
              maxZoom={18}
            />
            {centerTarget && <MapCenterer position={centerTarget} />}
            <Marker
              position={markerPos}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (ev) => {
                  const { lat: la, lng: lo } = ev.target.getLatLng();
                  setLat(parseFloat(la.toFixed(6)));
                  setLng(parseFloat(lo.toFixed(6)));
                },
              }}
            />
          </MapContainer>
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
          {errores.cupoMax && (
            <p className="form-helper form-helper--error">{errores.cupoMax}</p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">Precio de inscripción (CLP)</label>
          <input
            type="number"
            className={`form-input${errores.precio ? ' form-input--error' : ''}`}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            min={0}
            step="0.01"
          />
          {errores.precio && (
            <p className="form-helper form-helper--error">{errores.precio}</p>
          )}
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
