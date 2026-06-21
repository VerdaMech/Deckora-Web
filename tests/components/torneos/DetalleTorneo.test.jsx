import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { navigate, authState, torneosSvc, rondasSvc } = vi.hoisted(() => ({
  navigate: vi.fn(),
  authState: { value: {} },
  torneosSvc: { obtenerTorneo: vi.fn(), listarInscripciones: vi.fn(), cambiarEstadoTorneo: vi.fn() },
  rondasSvc: { listarRondas: vi.fn() },
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigate,
  useParams: () => ({ id: '1' }),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));
vi.mock('@/services/torneos.service', () => ({
  obtenerTorneo: (...a) => torneosSvc.obtenerTorneo(...a),
  listarInscripciones: (...a) => torneosSvc.listarInscripciones(...a),
  cambiarEstadoTorneo: (...a) => torneosSvc.cambiarEstadoTorneo(...a),
}));
vi.mock('@/services/rondas.service', () => ({ listarRondas: (...a) => rondasSvc.listarRondas(...a) }));
vi.mock('@/modules/torneos/components/PanelInscripcion', () => ({ default: () => <div data-testid="panel-inscripcion" /> }));
vi.mock('@/modules/torneos/components/BandejaInscripciones', () => ({ default: () => <div data-testid="bandeja" /> }));
vi.mock('@/modules/torneos/components/ListaInscritos', () => ({ default: () => <div data-testid="lista-inscritos" /> }));
vi.mock('@/components/domain/RoundView', () => ({ RoundView: () => <div data-testid="round-view" /> }));
vi.mock('@/modules/torneos/components/ReportarResultadoModal', () => ({ default: () => <div data-testid="reportar" /> }));

import DetalleTorneo from '@/modules/torneos/pages/DetalleTorneo';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  authState.value = { user: { id: 2, rol: 'jugador' } };
  torneosSvc.listarInscripciones.mockResolvedValue([]);
  rondasSvc.listarRondas.mockResolvedValue([]);
});

describe('DetalleTorneo', () => {
  it('muestra la vista de jugador con panel de inscripción', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER', organizador_id: 99 });
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.getByTestId('panel-inscripcion')).toBeInTheDocument();
  });

  it('muestra el error al fallar la carga', async () => {
    torneosSvc.obtenerTorneo.mockRejectedValue(new Error('no existe'));
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('no existe')).toBeInTheDocument());
  });

  it('permite al organizador cambiar el estado del torneo', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER', organizador_id: 5 });
    torneosSvc.cambiarEstadoTorneo.mockResolvedValue({});
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Administración')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Publicar torneo' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(torneosSvc.cambiarEstadoTorneo).toHaveBeenCalledWith('1', 'en_curso'));
  });

  it('muestra las rondas cuando el torneo está en curso', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER', organizador_id: 5 });
    rondasSvc.listarRondas.mockResolvedValue([{ id: 1, numero: 1 }, { id: 2, numero: 2 }]);
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getAllByTestId('round-view').length).toBe(2));
    expect(rondasSvc.listarRondas).toHaveBeenCalledWith('1');
  });
});
