import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mapboxMock, authState, toast, actualizarMiTienda, markerInstance } = vi.hoisted(() => {
  const marker = {
    setLngLat: vi.fn(function () { return marker; }),
    addTo: vi.fn(function () { return marker; }),
    on: vi.fn(),
    getLngLat: vi.fn(() => ({ lat: -33.1, lng: -70.2 })),
  };
  return {
    markerInstance: marker,
    mapboxMock: { accessToken: '', Map: vi.fn(function () { return { remove: vi.fn(), flyTo: vi.fn() }; }), Marker: vi.fn(function () { return marker; }) },
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

  it('actualiza lat/lng cuando se arrastra el marcador (dragend)', () => {
    render(<ConfiguracionTiendaTab />);
    // The marker.on('dragend', cb) was called during mount. Extract the callback.
    const dragendCall = markerInstance.on.mock.calls.find((c) => c[0] === 'dragend');
    expect(dragendCall).toBeTruthy();
    const dragendCb = dragendCall[1];

    // Simulate dragend: getLngLat returns new coords
    markerInstance.getLngLat.mockReturnValue({ lat: -34.567891, lng: -71.234567 });
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ features: [{ place_name: 'Calle Arrastrada 123' }] }),
    });

    act(() => { dragendCb(); });

    // After dragend, the component should call reversGeocode which calls fetch
    expect(global.fetch).toHaveBeenCalled();
  });

  it('muestra sugerencias de dirección al escribir', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const suggestions = [
      { id: 's1', place_name: 'Av. Providencia 1000, Santiago', center: [-70.6, -33.4] },
      { id: 's2', place_name: 'Av. Providencia 2000, Santiago', center: [-70.7, -33.5] },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ features: suggestions }),
    });

    render(<ConfiguracionTiendaTab />);
    const addressInput = screen.getByPlaceholderText('Ej: Av. Providencia 1234, Santiago');

    fireEvent.change(addressInput, { target: { value: 'Av. Providencia' } });

    // Advance past the 350ms debounce
    await act(async () => { vi.advanceTimersByTime(400); });

    await waitFor(() => {
      expect(screen.getByText('Av. Providencia 1000, Santiago')).toBeInTheDocument();
      expect(screen.getByText('Av. Providencia 2000, Santiago')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('selecciona una sugerencia y actualiza el mapa', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const suggestions = [
      { id: 's1', place_name: 'Calle Test 100', center: [-70.55, -33.33] },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ features: suggestions }),
    });

    render(<ConfiguracionTiendaTab />);
    const addressInput = screen.getByPlaceholderText('Ej: Av. Providencia 1234, Santiago');

    fireEvent.change(addressInput, { target: { value: 'Calle Test' } });
    await act(async () => { vi.advanceTimersByTime(400); });

    await waitFor(() => expect(screen.getByText('Calle Test 100')).toBeInTheDocument());

    // mouseDown to select suggestion
    fireEvent.mouseDown(screen.getByText('Calle Test 100'));

    // After selection, address input should have the selected value and suggestions should be cleared
    expect(addressInput.value).toBe('Calle Test 100');
    expect(screen.queryByText('Calle Test 100')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('envía el formulario con datos actualizados', async () => {
    actualizarMiTienda.mockResolvedValue({});
    render(<ConfiguracionTiendaTab />);

    const telefonoInput = screen.getByLabelText(/^Teléfono/);
    const horarioInput = screen.getByLabelText(/^Horario/);
    await userEvent.clear(telefonoInput);
    await userEvent.type(telefonoInput, '+56912345678');
    await userEvent.clear(horarioInput);
    await userEvent.type(horarioInput, 'Lun-Vie 10-20');

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(actualizarMiTienda).toHaveBeenCalledWith(1, expect.objectContaining({
      nombre_tienda: 'Mi Tienda',
      numero_telefono: '+56912345678',
      horario_apertura: 'Lun-Vie 10-20',
    })));
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('muestra error cuando falla el guardado', async () => {
    actualizarMiTienda.mockRejectedValue(new Error('Failed to fetch'));
    render(<ConfiguracionTiendaTab />);

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
    expect(await screen.findByText(/No se pudo conectar al servidor/i)).toBeInTheDocument();
  });
});
