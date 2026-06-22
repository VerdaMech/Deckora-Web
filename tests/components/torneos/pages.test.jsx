import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { navigate, toast, authState, torneosSvc } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: { mostrarExito: vi.fn(), mostrarError: vi.fn() },
  authState: { value: {} },
  torneosSvc: { listarTorneos: vi.fn(), crearTorneo: vi.fn(), obtenerTorneo: vi.fn(), actualizarTorneo: vi.fn() },
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigate,
  useParams: () => ({ id: '1' }),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('@/services/torneos.service', () => ({
  listarTorneos: (...a) => torneosSvc.listarTorneos(...a),
  crearTorneo: (...a) => torneosSvc.crearTorneo(...a),
  obtenerTorneo: (...a) => torneosSvc.obtenerTorneo(...a),
  actualizarTorneo: (...a) => torneosSvc.actualizarTorneo(...a),
}));
vi.mock('@/hooks/useDebounce', () => ({ useDebounce: (v) => v, default: (v) => v }));
vi.mock('@/modules/torneos/components/FormularioTorneo', () => ({
  default: ({ onSubmit, submitLabel }) => (
    <button onClick={() => onSubmit({ nombre: 'Nuevo' })}>{submitLabel}</button>
  ),
}));

import Cartelera from '@/modules/torneos/pages/Cartelera';
import CrearTorneo from '@/modules/torneos/pages/CrearTorneo';
import EditarTorneo from '@/modules/torneos/pages/EditarTorneo';
import MisTorneos from '@/modules/torneos/pages/MisTorneos';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  authState.value = { user: { id: 1 }, rol: 'jugador' };
});

describe('Cartelera', () => {
  it('lista los torneos disponibles', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 1, nombre: 'Liga Commander', formato: 'COMMANDER', estado: 'pendiente' }]);
    wrap(<Cartelera />);
    await waitFor(() => expect(screen.getByText('Liga Commander')).toBeInTheDocument());
  });

  it('muestra empty state sin torneos', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([]);
    wrap(<Cartelera />);
    await waitFor(() => expect(screen.getByText('No hay torneos disponibles')).toBeInTheDocument());
  });

  it('muestra el botón crear para organizadores', async () => {
    authState.value = { user: { id: 1 }, rol: 'organizador' };
    torneosSvc.listarTorneos.mockResolvedValue([]);
    wrap(<Cartelera />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Crear torneo' })).toBeInTheDocument());
  });

  it('permite limpiar los filtros cuando no hay coincidencias', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([]);
    wrap(<Cartelera />);
    await userEvent.type(screen.getByLabelText('Buscar torneos por nombre'), 'inexistente');
    await waitFor(() => expect(screen.getByText('No hay torneos que coincidan con tus filtros.')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByLabelText('Buscar torneos por nombre')).toHaveValue('');
  });

  it('muestra error y botón reintentar al fallar la carga', async () => {
    torneosSvc.listarTorneos.mockRejectedValue(new Error('Timeout'));
    wrap(<Cartelera />);
    await waitFor(() => expect(screen.getByText(/Timeout/)).toBeInTheDocument());
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('navega al detalle al hacer clic en un torneo', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 42, nombre: 'Commander Fest', formato: 'COMMANDER', estado: 'pendiente' }]);
    wrap(<Cartelera />);
    await waitFor(() => expect(screen.getByText('Commander Fest')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Commander Fest'));
    expect(navigate).toHaveBeenCalledWith('/torneos/42');
  });

  it('filtra por formato usando el select', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([]);
    wrap(<Cartelera />);
    await waitFor(() => expect(screen.getByText('No hay torneos disponibles')).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'COMMANDER' } });
    await waitFor(() => expect(torneosSvc.listarTorneos).toHaveBeenCalledWith(expect.objectContaining({ formato: 'COMMANDER' })));
  });

  it('filtra por estado usando el select', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([]);
    wrap(<Cartelera />);
    await waitFor(() => expect(screen.getByText('No hay torneos disponibles')).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'pendiente' } });
    await waitFor(() => expect(torneosSvc.listarTorneos).toHaveBeenCalledWith(expect.objectContaining({ estado: 'pendiente' })));
  });

  it('filtra por fecha usando el input date', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([]);
    wrap(<Cartelera />);
    await waitFor(() => expect(screen.getByText('No hay torneos disponibles')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Filtrar por fecha'), { target: { value: '2026-07-01' } });
    await waitFor(() => expect(torneosSvc.listarTorneos).toHaveBeenCalledWith(expect.objectContaining({ desde: '2026-07-01' })));
  });
});

describe('CrearTorneo', () => {
  it('crea el torneo y navega al detalle', async () => {
    torneosSvc.crearTorneo.mockResolvedValue({ id: 99 });
    wrap(<CrearTorneo />);
    await userEvent.click(screen.getByRole('button', { name: 'Crear torneo' }));
    await waitFor(() => expect(torneosSvc.crearTorneo).toHaveBeenCalled());
    expect(navigate).toHaveBeenCalledWith('/torneos/99');
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('notifica error si falla la creación', async () => {
    torneosSvc.crearTorneo.mockRejectedValue(new Error('boom'));
    wrap(<CrearTorneo />);
    await userEvent.click(screen.getByRole('button', { name: 'Crear torneo' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
  });
});

describe('EditarTorneo', () => {
  it('carga el torneo y guarda cambios', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga' });
    torneosSvc.actualizarTorneo.mockResolvedValue({});
    wrap(<EditarTorneo />);
    await waitFor(() => expect(screen.getByText('Editar torneo')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(torneosSvc.actualizarTorneo).toHaveBeenCalledWith('1', { nombre: 'Nuevo' }));
    expect(navigate).toHaveBeenCalledWith('/torneos/1');
  });

  it('muestra error si no carga', async () => {
    torneosSvc.obtenerTorneo.mockRejectedValue(new Error('no existe'));
    wrap(<EditarTorneo />);
    await waitFor(() => expect(screen.getByText('no existe')).toBeInTheDocument());
  });
});

describe('MisTorneos', () => {
  it('lista los torneos del organizador', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 3, nombre: 'Mi Liga', formato: 'COMMANDER', estado: 'pendiente' }]);
    wrap(<MisTorneos />);
    await waitFor(() => expect(screen.getByText('Mi Liga')).toBeInTheDocument());
  });

  it('muestra empty state sin torneos', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([]);
    wrap(<MisTorneos />);
    await waitFor(() => expect(screen.getByText('Sin torneos creados')).toBeInTheDocument());
  });

  it('muestra alerta de error al fallar la carga', async () => {
    torneosSvc.listarTorneos.mockRejectedValue(new Error('No se pudo conectar'));
    wrap(<MisTorneos />);
    await waitFor(() => expect(screen.getByText('No se pudo conectar')).toBeInTheDocument());
  });

  it('navega al detalle al hacer clic en un torneo', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 3, nombre: 'Mi Liga', formato: 'COMMANDER', estado: 'pendiente' }]);
    wrap(<MisTorneos />);
    await waitFor(() => expect(screen.getByText('Mi Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Mi Liga'));
    expect(navigate).toHaveBeenCalledWith('/torneos/3');
  });

  it('navega a crear torneo al pulsar el botón', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([]);
    wrap(<MisTorneos />);
    await waitFor(() => expect(screen.getByText('Sin torneos creados')).toBeInTheDocument());
    await userEvent.click(screen.getAllByRole('button', { name: 'Crear torneo' })[0]);
    expect(navigate).toHaveBeenCalledWith('/organizador/torneos/nuevo');
  });

  it('maneja respuesta con estructura { torneos: [...] }', async () => {
    torneosSvc.listarTorneos.mockResolvedValue({ torneos: [{ id: 4, nombre: 'Liga Wrapped', formato: 'STANDARD', estado: 'pendiente' }] });
    wrap(<MisTorneos />);
    await waitFor(() => expect(screen.getByText('Liga Wrapped')).toBeInTheDocument());
  });
});
