import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords } from 'lucide-react';

import { listarTorneos } from '@/services/torneos.service';
import { TournamentCard } from '@/components/domain/TournamentCard';
import { Button, Select, Alert, Skeleton } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { FORMATO_LABELS, ESTADO_TORNEO_LABELS } from '@/utils/constants';
import './Cartelera.css';

const FORMATO_OPCIONES = [
  { value: '', label: 'Todos los formatos' },
  ...Object.entries(FORMATO_LABELS).map(([value, label]) => ({ value, label })),
];

const ESTADO_OPCIONES = [
  { value: '', label: 'Todos los estados' },
  ...Object.entries(ESTADO_TORNEO_LABELS).map(([value, label]) => ({ value, label })),
];

export default function Cartelera() {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const puedeCrear = rol === 'organizador' || rol === 'tienda';
  const [torneos, setTorneos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtroFormato, setFiltroFormato] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 300);

  const hayFiltros = filtroFormato || filtroEstado || filtroFecha || busqueda;

  const cargarTorneos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = {};
      if (filtroFormato) params.formato = filtroFormato;
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroFecha) params.desde = filtroFecha;
      if (busquedaDebounced) params.q = busquedaDebounced;
      const data = await listarTorneos(params);
      setTorneos(Array.isArray(data) ? data : data?.torneos ?? data?.data ?? []);
    } catch (e) {
      setError(e.message ?? 'Error al cargar torneos');
    } finally {
      setCargando(false);
    }
  }, [filtroFormato, filtroEstado, filtroFecha, busquedaDebounced]);

  useEffect(() => {
    cargarTorneos();
  }, [cargarTorneos]);

  function limpiarFiltros() {
    setFiltroFormato('');
    setFiltroEstado('');
    setFiltroFecha('');
    setBusqueda('');
  }

  return (
    <div className="cartelera-page">
      <div className="cartelera-header">
        <div className="cartelera-header__content">
          <h1 className="cartelera-header__title">Cartelera de torneos</h1>
          <p className="cartelera-header__subtitle">Explorá y encontrá tu próximo torneo de Magic.</p>
        </div>
        {puedeCrear && (
          <Button variant="primary" onClick={() => navigate('/organizador/torneos/nuevo')}>
            Crear torneo
          </Button>
        )}
      </div>

      <div className="cartelera-filtros">
        <input
          className="cartelera-filtros__busqueda"
          type="text"
          placeholder="Buscar por nombre..."
          aria-label="Buscar torneos por nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Select
          value={filtroFormato}
          onChange={(e) => setFiltroFormato(e.target.value)}
          options={FORMATO_OPCIONES}
        />
        <Select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          options={ESTADO_OPCIONES}
        />
        <input
          className="cartelera-filtros__fecha"
          type="date"
          aria-label="Filtrar por fecha"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
      </div>

      {error && (
        <Alert variant="danger" className="cartelera-error">
          {error}{' '}
          <button className="cartelera-error__reintentar" onClick={cargarTorneos}>
            Reintentar
          </button>
        </Alert>
      )}

      {cargando && (
        <div className="cartelera-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={260} className="cartelera-grid__skeleton" />
          ))}
        </div>
      )}

      {!cargando && !error && torneos.length === 0 && (
        <div className="cartelera-empty">
          <Swords size={48} className="cartelera-empty__icon" />
          <h3 className="cartelera-empty__title">No hay torneos disponibles</h3>
          <p className="cartelera-empty__desc">
            {hayFiltros
              ? 'Ningún torneo coincide con los filtros aplicados.'
              : 'Pronto habrá nuevos torneos. Revisá más tarde.'}
          </p>
          {hayFiltros && (
            <Button variant="ghost" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {!cargando && !error && torneos.length > 0 && (
        <div className="cartelera-grid">
          {torneos.map((torneo) => (
            <TournamentCard
              key={torneo.id}
              torneo={torneo}
              onClick={() => navigate(`/torneos/${torneo.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
