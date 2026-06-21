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
});
