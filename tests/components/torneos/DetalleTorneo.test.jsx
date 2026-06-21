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
vi.mock('@/components/domain/RoundView', () => ({
  RoundView: ({ ronda, editable, onReportarResultado }) => (
    <div data-testid="round-view">
      <span>ronda:{ronda.numero}</span>
      {editable && onReportarResultado && (
        <button onClick={() => onReportarResultado({ id: 'enf1', ronda_id: ronda.id })}>
          Reportar resultado
        </button>
      )}
    </div>
  ),
}));
vi.mock('@/modules/torneos/components/ReportarResultadoModal', () => ({
  default: ({ enfrentamiento, isOpen, onClose, onReportado }) =>
    isOpen ? (
      <div data-testid="reportar">
        <span>enfrentamiento:{enfrentamiento?.id}</span>
        <button onClick={onReportado}>confirmar-resultado</button>
        <button onClick={onClose}>cerrar-modal</button>
      </div>
    ) : null,
}));

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

  it('handleResultadoReportado: abre modal al reportar y recarga rondas al confirmar', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER', organizador_id: 5 });
    rondasSvc.listarRondas.mockResolvedValue([{ id: 10, numero: 1 }]);
    wrap(<DetalleTorneo />);

    // Wait for round to render with the "Reportar resultado" button
    await waitFor(() => expect(screen.getByText('Reportar resultado')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Reportar resultado'));

    // Modal should open with the enfrentamiento data
    expect(await screen.findByTestId('reportar')).toBeInTheDocument();
    expect(screen.getByText('enfrentamiento:enf1')).toBeInTheDocument();

    // Confirm resultado -> handleResultadoReportado refetches rondas
    rondasSvc.listarRondas.mockResolvedValue([{ id: 10, numero: 1 }]);
    await userEvent.click(screen.getByText('confirmar-resultado'));

    // listarRondas should be called again (initial load + after report)
    await waitFor(() => expect(rondasSvc.listarRondas).toHaveBeenCalledTimes(2));
  });

  it('organizer sees admin buttons: Gestionar, Editar, Cancelar', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER', organizador_id: 5 });
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Administración')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Gestionar torneo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar torneo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar torneo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicar torneo' })).toBeInTheDocument();
  });

  it('organizer with tienda role also sees admin UI', async () => {
    authState.value = { user: { id: 7, rol: 'tienda' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER', organizador_id: 7 });
    rondasSvc.listarRondas.mockResolvedValue([]);
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Administración')).toBeInTheDocument());
    // en_curso shows "Finalizar torneo" button instead of "Publicar torneo"
    expect(screen.getByRole('button', { name: 'Finalizar torneo' })).toBeInTheDocument();
  });

  it('renders pendiente state: placeholder for rondas and Publicar button', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER', organizador_id: 5 });
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.getByText('Las rondas aparecerán cuando el torneo inicie.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicar torneo' })).toBeInTheDocument();
  });

  it('renders en_curso state with empty rounds placeholder', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER', organizador_id: 5 });
    rondasSvc.listarRondas.mockResolvedValue([]);
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.getByText('El torneo comenzó pero aún no hay rondas creadas.')).toBeInTheDocument();
  });

  it('renders finalizado state: no Publicar/Finalizar buttons, loads rondas', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'finalizado', formato: 'COMMANDER', organizador_id: 5 });
    rondasSvc.listarRondas.mockResolvedValue([{ id: 1, numero: 1 }]);
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(rondasSvc.listarRondas).toHaveBeenCalledWith('1');
    // finalizado should not show Publicar or Finalizar buttons
    expect(screen.queryByRole('button', { name: 'Publicar torneo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Finalizar torneo' })).not.toBeInTheDocument();
  });

  it('non-organizer player sees rondas placeholder for pendiente', async () => {
    authState.value = { user: { id: 2, rol: 'jugador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER', organizador_id: 99 });
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.getByText('Las rondas aparecerán cuando el torneo inicie.')).toBeInTheDocument();
    expect(screen.queryByText('Administración')).not.toBeInTheDocument();
  });

  it('navigate to gestion when Gestionar torneo is clicked', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER', organizador_id: 5 });
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Administración')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Gestionar torneo' }));
    expect(navigate).toHaveBeenCalledWith('/organizador/torneos/1/gestion');
  });

  it('navigate to editar when Editar torneo is clicked', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER', organizador_id: 5 });
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Administración')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar torneo' }));
    expect(navigate).toHaveBeenCalledWith('/organizador/torneos/1/editar');
  });

  it('shows error when cambiarEstadoTorneo fails', async () => {
    authState.value = { user: { id: 5, rol: 'organizador' } };
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER', organizador_id: 5 });
    torneosSvc.cambiarEstadoTorneo.mockRejectedValue(new Error('No autorizado'));
    wrap(<DetalleTorneo />);
    await waitFor(() => expect(screen.getByText('Administración')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Publicar torneo' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(screen.getByText('No autorizado')).toBeInTheDocument());
  });
});
