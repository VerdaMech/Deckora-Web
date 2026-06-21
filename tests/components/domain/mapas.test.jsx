import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { mapboxMock } = vi.hoisted(() => {
  const map = {
    addControl: vi.fn(),
    remove: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    loaded: vi.fn(() => true),
    jumpTo: vi.fn(),
    flyTo: vi.fn(),
  };
  const marker = {
    setLngLat: vi.fn(() => marker),
    setPopup: vi.fn(() => marker),
    addTo: vi.fn(() => marker),
    remove: vi.fn(),
  };
  const popup = { setHTML: vi.fn(() => popup), on: vi.fn(), remove: vi.fn() };
  return {
    mapboxMock: {
      accessToken: '',
      setTelemetryEnabled: vi.fn(),
      Map: vi.fn(function () { return map; }),
      NavigationControl: vi.fn(),
      Marker: vi.fn(function () { return marker; }),
      Popup: vi.fn(function () { return popup; }),
      _map: map,
    },
  };
});

vi.mock('mapbox-gl', () => ({ default: mapboxMock }));

import MapaTiendas from '@/components/domain/MapaTiendas';
import MiniMapaTienda from '@/components/domain/MiniMapaTienda';

describe('MapaTiendas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('inicializa el mapa de mapbox', () => {
    render(<MapaTiendas tiendas={[]} />);
    expect(mapboxMock.Map).toHaveBeenCalled();
  });

  it('muestra el empty state cuando no hay tiendas', () => {
    render(<MapaTiendas tiendas={[]} />);
    expect(screen.getByText(/no hay tiendas para mostrar/i)).toBeInTheDocument();
  });

  it('renderiza el botón de geolocalización por defecto', () => {
    render(<MapaTiendas tiendas={[]} />);
    expect(screen.getByRole('button', { name: 'Mi ubicación' })).toBeInTheDocument();
  });

  it('puede ocultar el botón de geolocalización', () => {
    render(<MapaTiendas tiendas={[]} mostrarBotonGeo={false} />);
    expect(screen.queryByRole('button', { name: 'Mi ubicación' })).not.toBeInTheDocument();
  });

  it('crea un marcador por cada tienda con coordenadas', () => {
    render(<MapaTiendas tiendas={[{ id: 1, nombre: 'T1', latitud: -33, longitud: -70 }]} />);
    expect(mapboxMock.Marker).toHaveBeenCalled();
  });
});

describe('MiniMapaTienda', () => {
  beforeEach(() => vi.clearAllMocks());

  it('inicializa un mapa para la tienda', () => {
    const { container } = render(<MiniMapaTienda tienda={{ latitud: -33.4, longitud: -70.6 }} />);
    expect(container.querySelector('.mini-mapa-tienda__map')).toBeInTheDocument();
    expect(mapboxMock.Map).toHaveBeenCalled();
  });
});
