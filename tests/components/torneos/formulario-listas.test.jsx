import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mapboxMock, authState, svc } = vi.hoisted(() => {
  const map = { remove: vi.fn(), flyTo: vi.fn() };
  const marker = { setLngLat: vi.fn(() => marker), addTo: vi.fn(() => marker) };
  return {
    mapboxMock: { accessToken: '', Map: vi.fn(function () { return map; }), Marker: vi.fn(function () { return marker; }) },
    authState: { value: {} },
    svc: { obtenerSnapshotInscripcion: vi.fn(), actualizarResultado: vi.fn() },
  };
});

vi.mock('mapbox-gl', () => ({ default: mapboxMock }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));
vi.mock('@/services/torneos.service', () => ({ obtenerSnapshotInscripcion: (...a) => svc.obtenerSnapshotInscripcion(...a) }));
vi.mock('@/services/enfrentamientos.service', () => ({ actualizarResultado: (...a) => svc.actualizarResultado(...a) }));

import FormularioTorneo from '@/modules/torneos/components/FormularioTorneo';
import ListaInscritos from '@/modules/torneos/components/ListaInscritos';
import SnapshotMazoModal from '@/modules/torneos/components/SnapshotMazoModal';
import ReportarResultadoModal from '@/modules/torneos/components/ReportarResultadoModal';

beforeEach(() => {
  vi.clearAllMocks();
  authState.value = { user: { id: 1 } };
});

describe('FormularioTorneo', () => {
  it('valida campos requeridos al enviar vacío', async () => {
    const onSubmit = vi.fn();
    render(<FormularioTorneo onSubmit={onSubmit} submitLabel="Crear torneo" />);
    await userEvent.click(screen.getByRole('button', { name: 'Crear torneo' }));
    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
    expect(screen.getByText('La fecha de inicio es requerida')).toBeInTheDocument();
    expect(screen.getByText('La ubicación es requerida')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envía los datos cuando el formulario es válido', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FormularioTorneo onSubmit={onSubmit} submitLabel="Crear torneo" />);
    await userEvent.type(screen.getByLabelText(/^Nombre/), 'Mi Torneo');
    const fecha = screen.getByLabelText(/Fecha de inicio/);
    await userEvent.type(fecha, '2030-12-31T18:00');
    await userEvent.type(screen.getByPlaceholderText(/Av\. Providencia/), 'Santiago Centro');
    await userEvent.click(screen.getByRole('button', { name: 'Crear torneo' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ nombre: 'Mi Torneo', ubicacion: 'Santiago Centro' });
  });

  it('usa la geolocalización y rellena la ubicación', async () => {
    const getCurrentPosition = vi.fn((success) => success({ coords: { latitude: -33.5, longitude: -70.7 } }));
    Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition }, configurable: true });
    global.fetch = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ features: [{ place_name: 'Providencia, Santiago' }] }) });
    render(<FormularioTorneo onSubmit={vi.fn()} submitLabel="Crear torneo" />);
    await userEvent.click(screen.getByRole('button', { name: 'Usar mi ubicación' }));
    expect(getCurrentPosition).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByDisplayValue('Providencia, Santiago')).toBeInTheDocument());
  });

});

describe('ListaInscritos', () => {
  it('muestra mensaje cuando no hay inscritos', () => {
    render(<ListaInscritos inscripciones={[]} />);
    expect(screen.getByText(/aún no hay jugadores inscritos/i)).toBeInTheDocument();
  });

  it('lista inscritos y permite cancelar el propio', async () => {
    const onCancelar = vi.fn();
    render(
      <ListaInscritos
        editable
        onCancelar={onCancelar}
        inscripciones={[{ id: 1, usuario_id: 1, Jugador: { Usuario: { nombre_usuario: 'ana' } }, Mazo: { nombre: 'Atraxa' } }]}
      />,
    );
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText(/Atraxa/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });

  it('soporta inscripciones con campos alternativos (mazo, created_at) de otros jugadores', () => {
    render(
      <ListaInscritos
        editable
        onCancelar={vi.fn()}
        inscripciones={[{ id: 2, jugador_id: 99, Jugador: { Usuario: { nombre_usuario: 'beto' } }, mazo: { nombre: 'Krenko', comandante: 'Krenko' }, created_at: '2026-01-01' }]}
      />,
    );
    expect(screen.getByText('beto')).toBeInTheDocument();
    expect(screen.getByText(/Krenko · Krenko/)).toBeInTheDocument();
    // no es propio (jugador_id !== user.id) => sin botón cancelar
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });
});

describe('SnapshotMazoModal', () => {
  it('muestra spinner y luego las cartas', async () => {
    svc.obtenerSnapshotInscripcion.mockResolvedValue([{ id: 1, cantidad: 2, Carta: { nombre: 'Sol Ring', tipo: 'Artifact' } }]);
    render(<SnapshotMazoModal torneoId={1} inscripcion={{ id: 9, Mazo: { nombre: 'Mazo X' } }} onClose={vi.fn()} />);
    expect(await screen.findByText('Sol Ring')).toBeInTheDocument();
    expect(screen.getByText('×2')).toBeInTheDocument();
  });

  it('muestra error al fallar la carga', async () => {
    svc.obtenerSnapshotInscripcion.mockRejectedValue(new Error('falló'));
    render(<SnapshotMazoModal torneoId={1} inscripcion={{ id: 9 }} onClose={vi.fn()} />);
    expect(await screen.findByText('falló')).toBeInTheDocument();
  });
});

describe('ReportarResultadoModal', () => {
  const enfrentamiento = {
    id: 1,
    numero_mesa: 2,
    participantes: [
      { inscripcion_id: 1, nombre: 'Ana', resultado: 'pendiente' },
      { inscripcion_id: 2, nombre: 'Beto', resultado: 'pendiente' },
    ],
  };

  it('exige completar todos los resultados', async () => {
    render(<ReportarResultadoModal enfrentamiento={enfrentamiento} isOpen onClose={vi.fn()} onReportado={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar resultado' }));
    expect(await screen.findByText(/completá el resultado de todos/i)).toBeInTheDocument();
    expect(svc.actualizarResultado).not.toHaveBeenCalled();
  });

  it('guarda el resultado válido', async () => {
    svc.actualizarResultado.mockResolvedValue({});
    const onReportado = vi.fn();
    const onClose = vi.fn();
    render(<ReportarResultadoModal enfrentamiento={enfrentamiento} isOpen onClose={onClose} onReportado={onReportado} />);
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'ganador');
    await userEvent.selectOptions(selects[1], 'perdedor');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar resultado' }));
    await waitFor(() => expect(svc.actualizarResultado).toHaveBeenCalledWith(1, expect.objectContaining({ resultados: expect.any(Array) })));
    expect(onReportado).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
