import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { navigate, torneosSvc, rondasSvc } = vi.hoisted(() => ({
  navigate: vi.fn(),
  torneosSvc: { obtenerTorneo: vi.fn(), cambiarEstadoTorneo: vi.fn() },
  rondasSvc: { listarRondas: vi.fn(), crearRonda: vi.fn(), eliminarRonda: vi.fn() },
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigate,
  useParams: () => ({ id: '1' }),
}));
vi.mock('@/services/torneos.service', () => ({
  obtenerTorneo: (...a) => torneosSvc.obtenerTorneo(...a),
  cambiarEstadoTorneo: (...a) => torneosSvc.cambiarEstadoTorneo(...a),
}));
vi.mock('@/services/rondas.service', () => ({
  listarRondas: (...a) => rondasSvc.listarRondas(...a),
  crearRonda: (...a) => rondasSvc.crearRonda(...a),
  eliminarRonda: (...a) => rondasSvc.eliminarRonda(...a),
}));
vi.mock('@/components/domain/RoundView', () => ({ RoundView: () => <div data-testid="round-view" /> }));
vi.mock('@/modules/torneos/components/ReportarResultadoModal', () => ({ default: () => <div data-testid="reportar" /> }));

import GestionTorneo from '@/modules/torneos/pages/GestionTorneo';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  rondasSvc.listarRondas.mockResolvedValue([]);
});

describe('GestionTorneo', () => {
  it('muestra el torneo y la pestaña de nueva ronda', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.getByRole('tab', { name: '+ Nueva ronda' })).toBeInTheDocument();
  });

  it('crea una ronda nueva', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    rondasSvc.crearRonda.mockResolvedValue({ id: 5, numero_ronda: 1 });
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Crear ronda' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Crear ronda' }));
    await waitFor(() => expect(rondasSvc.crearRonda).toHaveBeenCalledWith('1', { tipo: 'swiss' }));
    expect(await screen.findByText('Ronda creada')).toBeInTheDocument();
  });

  it('permite cambiar el estado del torneo (finalizar)', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    torneosSvc.cambiarEstadoTorneo.mockResolvedValue({});
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Finalizar torneo' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Finalizar torneo' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(torneosSvc.cambiarEstadoTorneo).toHaveBeenCalledWith('1', 'finalizado'));
  });

  it('muestra error si falla la carga', async () => {
    torneosSvc.obtenerTorneo.mockRejectedValue(new Error('falló'));
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('falló')).toBeInTheDocument());
  });
});
