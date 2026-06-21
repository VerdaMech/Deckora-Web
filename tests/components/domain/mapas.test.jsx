import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mapboxMock, geoState } = vi.hoisted(() => {
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
    getElement: vi.fn(() => document.createElement('div')),
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
    geoState: { value: { coords: null, loading: false, error: null, requestLocation: vi.fn() } },
  };
});

vi.mock('mapbox-gl', () => ({ default: mapboxMock }));
vi.mock('@/hooks/useGeolocation', () => ({ useGeolocation: () => geoState.value }));

import MapaTiendas from '@/components/domain/MapaTiendas';
import MiniMapaTienda from '@/components/domain/MiniMapaTienda';

describe('MapaTiendas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    geoState.value = { coords: null, loading: false, error: null, requestLocation: vi.fn() };
  });

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

  it('registra callback popup.on("open") para cada tienda', () => {
    const popup = { setHTML: vi.fn(function () { return this; }), on: vi.fn(), remove: vi.fn() };
    mapboxMock.Popup = vi.fn(function () { return popup; });
    render(<MapaTiendas tiendas={[{ id: 1, nombre: 'T1', latitud: -33, longitud: -70, nombre_usuario: 'shop1' }]} />);
    expect(popup.on).toHaveBeenCalledWith('open', expect.any(Function));
  });

  it('llama flyTo cuando coords cambian', () => {
    geoState.value = { coords: { lat: -33.5, lng: -70.5 }, loading: false, error: null, requestLocation: vi.fn() };
    render(<MapaTiendas tiendas={[]} />);
    expect(mapboxMock._map.flyTo).toHaveBeenCalledWith({ center: [-70.5, -33.5], zoom: 12 });
  });

  it('llama requestLocation al hacer clic en botón de geolocalizacion', async () => {
    const reqLoc = vi.fn();
    geoState.value = { coords: null, loading: false, error: null, requestLocation: reqLoc };
    render(<MapaTiendas tiendas={[]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Mi ubicación' }));
    expect(reqLoc).toHaveBeenCalled();
  });

  it('centra el mapa en tiendas con jumpTo al cargar cuando loaded=true', () => {
    mapboxMock._map.loaded.mockReturnValue(true);
    render(<MapaTiendas tiendas={[{ id: 1, nombre: 'T1', latitud: -33, longitud: -70 }]} />);
    expect(mapboxMock._map.jumpTo).toHaveBeenCalledWith(expect.objectContaining({ zoom: 14 }));
  });

  it('usa once("load") para centrar si mapa no loaded', () => {
    mapboxMock._map.loaded.mockReturnValue(false);
    render(<MapaTiendas tiendas={[{ id: 1, nombre: 'T1', latitud: -33, longitud: -70 }]} />);
    expect(mapboxMock._map.once).toHaveBeenCalledWith('load', expect.any(Function));
  });

  it('ignora tiendas sin coordenadas', () => {
    render(<MapaTiendas tiendas={[{ id: 1, nombre: 'T1' }, { id: 2, nombre: 'T2', latitud: -33, longitud: -70 }]} />);
    // Solo debe crear 1 marker (la tienda con coordenadas)
    expect(mapboxMock.Marker).toHaveBeenCalledTimes(1);
  });

  it('invoca onPinClick al hacer clic en elemento del marker', () => {
    const onPin = vi.fn();
    const elMock = document.createElement('div');
    const markerInst = {
      setLngLat: vi.fn(function () { return this; }),
      setPopup: vi.fn(function () { return this; }),
      addTo: vi.fn(function () { return this; }),
      remove: vi.fn(),
    };
    mapboxMock.Marker = vi.fn(function ({ element }) {
      // capture the element to simulate click
      elMock._ref = element;
      return markerInst;
    });
    render(<MapaTiendas tiendas={[{ id: 1, nombre: 'T1', latitud: -33, longitud: -70 }]} onPinClick={onPin} />);
    // The component adds an event listener to el; simulate click on the created element
    // The mock creates a div element inside the effect; we get it from the Marker call
    const call = mapboxMock.Marker.mock.calls[0];
    const el = call[0]?.element;
    if (el) el.click();
    expect(onPin).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
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
