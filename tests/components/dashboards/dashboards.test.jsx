import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { authState } = vi.hoisted(() => ({ authState: { value: {} } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));

const listarMisMazos = vi.fn();
const listarTorneosDelJugador = vi.fn();
const listarMisTorneos = vi.fn();
const listarTorneosDeTienda = vi.fn();
vi.mock('@/services/mazos.service', () => ({ listarMisMazos: (...a) => listarMisMazos(...a) }));
vi.mock('@/services/torneos.service', () => ({
  listarTorneosDelJugador: (...a) => listarTorneosDelJugador(...a),
  listarMisTorneos: (...a) => listarMisTorneos(...a),
}));
vi.mock('@/services/tiendas.service', () => ({ listarTorneosDeTienda: (...a) => listarTorneosDeTienda(...a) }));
vi.mock('@/components/domain/EstadisticasJugador', () => ({ default: () => <div data-testid="stats-jugador" /> }));
vi.mock('@/modules/torneos/components/BandejaInscripciones', () => ({ default: () => <div data-testid="bandeja" /> }));

import DashboardJugador from '@/modules/dashboards/pages/DashboardJugador';
import DashboardOrganizador from '@/modules/dashboards/pages/DashboardOrganizador';
import DashboardTienda from '@/modules/dashboards/pages/DashboardTienda';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  authState.value = { user: { id: 1, nombre_usuario: 'ana' }, perfil: {} };
});

describe('DashboardJugador', () => {
  it('saluda al usuario y muestra sus mazos recientes', async () => {
    listarMisMazos.mockResolvedValue([{ id: 1, nombre: 'Atraxa', formato: 'COMMANDER', updated_at: '2026-01-01' }]);
    listarTorneosDelJugador.mockResolvedValue({ data: [] });
    wrap(<DashboardJugador />);
    expect(screen.getByText('ana')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Atraxa')).toBeInTheDocument());
  });

  it('muestra empty states cuando no hay datos', async () => {
    listarMisMazos.mockResolvedValue([]);
    listarTorneosDelJugador.mockResolvedValue({ data: [] });
    wrap(<DashboardJugador />);
    await waitFor(() => expect(screen.getByText('Sin mazos todavía')).toBeInTheDocument());
    expect(screen.getByText('Sin torneos próximos')).toBeInTheDocument();
  });

  it('maneja error de listarMisMazos sin romper la UI', async () => {
    listarMisMazos.mockRejectedValue(new Error('Error de red'));
    listarTorneosDelJugador.mockResolvedValue({ data: [] });
    wrap(<DashboardJugador />);
    await waitFor(() => expect(screen.getByText('Sin mazos todavía')).toBeInTheDocument());
  });

  it('muestra torneos con fecha formateada', async () => {
    listarMisMazos.mockResolvedValue([]);
    listarTorneosDelJugador.mockResolvedValue({
      data: [{ id: 10, nombre: 'Liga Julio', fecha: '2026-07-15' }],
    });
    wrap(<DashboardJugador />);
    await waitFor(() => expect(screen.getByText('Liga Julio')).toBeInTheDocument());
  });

  it('muestra torneos con fecha_inicio en vez de fecha', async () => {
    listarMisMazos.mockResolvedValue([]);
    listarTorneosDelJugador.mockResolvedValue({
      data: [{ id: 11, nombre: 'Torneo Agosto', fecha_inicio: '2026-08-20' }],
    });
    wrap(<DashboardJugador />);
    await waitFor(() => expect(screen.getByText('Torneo Agosto')).toBeInTheDocument());
  });

  it('usa el correo como nombre cuando nombre_usuario no existe', async () => {
    authState.value = { user: { id: 2, correo: 'test@deckora.cl' }, perfil: {} };
    listarMisMazos.mockResolvedValue([]);
    listarTorneosDelJugador.mockResolvedValue({ data: [] });
    wrap(<DashboardJugador />);
    expect(screen.getByText('test@deckora.cl')).toBeInTheDocument();
  });

  it('maneja error de listarTorneosDelJugador sin romper la UI', async () => {
    listarMisMazos.mockResolvedValue([]);
    listarTorneosDelJugador.mockRejectedValue(new Error('Error torneos'));
    wrap(<DashboardJugador />);
    await waitFor(() => expect(screen.getByText('Sin torneos próximos')).toBeInTheDocument());
  });

  it('ordena mazos recientes por fecha de actualización', async () => {
    listarMisMazos.mockResolvedValue([
      { id: 1, nombre: 'Viejo', formato: 'COMMANDER', updated_at: '2025-01-01' },
      { id: 2, nombre: 'Nuevo', formato: 'COMMANDER', updated_at: '2026-06-01' },
      { id: 3, nombre: 'Medio', formato: 'COMMANDER', updated_at: '2025-07-01' },
    ]);
    listarTorneosDelJugador.mockResolvedValue({ data: [] });
    wrap(<DashboardJugador />);
    await waitFor(() => expect(screen.getByText('Nuevo')).toBeInTheDocument());
  });
});

describe('DashboardOrganizador', () => {
  it('muestra torneos recientes y la bandeja', async () => {
    listarMisTorneos.mockResolvedValue({ data: [{ id: 7, nombre: 'Liga', estado: 'pendiente' }] });
    wrap(<DashboardOrganizador />);
    expect(screen.getByTestId('bandeja')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
  });

  it('muestra empty state sin torneos', async () => {
    listarMisTorneos.mockResolvedValue({ data: [] });
    wrap(<DashboardOrganizador />);
    await waitFor(() => expect(screen.getByText('Sin torneos creados')).toBeInTheDocument());
  });

  it('maneja error de listarMisTorneos sin romper la UI', async () => {
    listarMisTorneos.mockRejectedValue(new Error('Error de red'));
    wrap(<DashboardOrganizador />);
    await waitFor(() => expect(screen.getByText('Sin torneos creados')).toBeInTheDocument());
  });

  it('ordena torneos recientes por fecha de creación', async () => {
    listarMisTorneos.mockResolvedValue({
      data: [
        { id: 1, nombre: 'Viejo', estado: 'finalizado', createdAt: '2025-01-01' },
        { id: 2, nombre: 'Nuevo', estado: 'pendiente', createdAt: '2026-06-01' },
      ],
    });
    wrap(<DashboardOrganizador />);
    await waitFor(() => expect(screen.getByText('Nuevo')).toBeInTheDocument());
    expect(screen.getByText('Viejo')).toBeInTheDocument();
  });
});

describe('DashboardTienda', () => {
  it('muestra próximos eventos de la tienda', async () => {
    const futuro = new Date(Date.now() + 86400000).toISOString();
    listarTorneosDeTienda.mockResolvedValue({ data: [{ id: 3, nombre: 'Evento Tienda', fecha_inicio: futuro }] });
    wrap(<DashboardTienda />);
    await waitFor(() => expect(screen.getByText('Evento Tienda')).toBeInTheDocument());
  });

  it('muestra empty state sin eventos próximos', async () => {
    listarTorneosDeTienda.mockResolvedValue({ data: [] });
    wrap(<DashboardTienda />);
    await waitFor(() => expect(screen.getByText('Sin eventos próximos')).toBeInTheDocument());
  });

  it('maneja error de listarTorneosDeTienda sin romper la UI', async () => {
    listarTorneosDeTienda.mockRejectedValue(new Error('Error'));
    wrap(<DashboardTienda />);
    await waitFor(() => expect(screen.getByText('Sin eventos próximos')).toBeInTheDocument());
  });
});
