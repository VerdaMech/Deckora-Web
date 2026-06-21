import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mapboxMock, authState, toast, actualizarMiTienda } = vi.hoisted(() => {
  const map = { remove: vi.fn(), flyTo: vi.fn() };
  const marker = {
    setLngLat: vi.fn(() => marker),
    addTo: vi.fn(() => marker),
    on: vi.fn(),
    getLngLat: vi.fn(() => ({ lat: -33.1, lng: -70.2 })),
  };
  return {
    mapboxMock: { accessToken: '', Map: vi.fn(function () { return map; }), Marker: vi.fn(function () { return marker; }) },
    authState: { value: {} },
    toast: { mostrarExito: vi.fn(), mostrarError: vi.fn() },
    actualizarMiTienda: vi.fn(),
  };
});

vi.mock('mapbox-gl', () => ({ default: mapboxMock }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('@/services/tiendas.service', () => ({ actualizarMiTienda: (...a) => actualizarMiTienda(...a) }));

import ConfiguracionTiendaTab from '@/modules/identidad/components/ConfiguracionTiendaTab';

beforeEach(() => {
  vi.clearAllMocks();
  authState.value = { user: { id: 1 }, perfil: { nombre_tienda: 'Mi Tienda', direccion: 'Calle 1' } };
});

describe('ConfiguracionTiendaTab', () => {
  it('renderiza el formulario con los datos del perfil', () => {
    render(<ConfiguracionTiendaTab />);
    expect(screen.getByText('Configuración de tienda')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mi Tienda')).toBeInTheDocument();
    expect(mapboxMock.Map).toHaveBeenCalled();
  });

  it('valida que el nombre de la tienda no sea solo espacios', async () => {
    authState.value = { user: { id: 1 }, perfil: {} };
    render(<ConfiguracionTiendaTab />);
    // Espacios satisfacen el required nativo pero fallan el trim() del componente
    await userEvent.type(screen.getByLabelText(/^Nombre de la tienda/), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('El nombre de la tienda es obligatorio.')).toBeInTheDocument();
    expect(actualizarMiTienda).not.toHaveBeenCalled();
  });

  it('guarda los datos de la tienda', async () => {
    actualizarMiTienda.mockResolvedValue({});
    render(<ConfiguracionTiendaTab />);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(actualizarMiTienda).toHaveBeenCalledWith(1, expect.objectContaining({ nombre_tienda: 'Mi Tienda' })));
    expect(toast.mostrarExito).toHaveBeenCalled();
    expect(await screen.findByText(/se guardaron correctamente/i)).toBeInTheDocument();
  });

  it('usa la geolocalización del navegador', async () => {
    const getCurrentPosition = vi.fn((success) => success({ coords: { latitude: -33.5, longitude: -70.7 } }));
    Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition }, configurable: true });
    global.fetch = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ features: [{ place_name: 'Nueva dir' }] }) });
    render(<ConfiguracionTiendaTab />);
    await userEvent.click(screen.getByRole('button', { name: 'Usar mi ubicación' }));
    expect(getCurrentPosition).toHaveBeenCalled();
  });
});
