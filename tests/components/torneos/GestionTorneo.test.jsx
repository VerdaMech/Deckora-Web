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

  it('muestra botón Volver a cartelera cuando hay error de carga', async () => {
    torneosSvc.obtenerTorneo.mockRejectedValue(new Error('error servidor'));
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('error servidor')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Volver a cartelera' }));
    expect(navigate).toHaveBeenCalledWith('/torneos');
  });

  it('muestra error cuando falla cambiarEstadoTorneo', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    torneosSvc.cambiarEstadoTorneo.mockRejectedValue(new Error('No autorizado'));
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Finalizar torneo' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(screen.getByText('No autorizado')).toBeInTheDocument());
  });

  it('muestra Publicar torneo y Cancelar torneo para estado pendiente', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER' });
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Publicar torneo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar torneo' })).toBeInTheDocument();
  });

  it('permite publicar torneo desde estado pendiente', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER' });
    torneosSvc.cambiarEstadoTorneo.mockResolvedValue({});
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Publicar torneo' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Publicar torneo' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(torneosSvc.cambiarEstadoTorneo).toHaveBeenCalledWith('1', 'en_curso'));
  });

  it('permite cancelar torneo desde estado en_curso', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    torneosSvc.cambiarEstadoTorneo.mockResolvedValue({});
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancelar torneo' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar torneo' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(torneosSvc.cambiarEstadoTorneo).toHaveBeenCalledWith('1', 'cancelado'));
  });

  it('no muestra botones de estado para torneo finalizado', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'finalizado', formato: 'COMMANDER' });
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Publicar torneo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Finalizar torneo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar torneo' })).not.toBeInTheDocument();
  });

  it('no muestra botones de estado para torneo cancelado', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'cancelado', formato: 'COMMANDER' });
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Publicar torneo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar torneo' })).not.toBeInTheDocument();
  });

  it('muestra error cuando falla crearRonda', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    rondasSvc.crearRonda.mockRejectedValue(new Error('Error al crear'));
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Crear ronda' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Crear ronda' }));
    await waitFor(() => expect(screen.getByText('Error al crear')).toBeInTheDocument());
  });

  it('navega a la pagina publica del torneo al hacer clic en Volver al torneo', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /Volver al torneo/ }));
    expect(navigate).toHaveBeenCalledWith('/torneos/1');
  });

  it('navega a editar torneo al hacer clic en Editar torneo', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar torneo' }));
    expect(navigate).toHaveBeenCalledWith('/organizador/torneos/1/editar');
  });

  it('cierra el modal de confirmacion de estado al hacer Cancelar', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Finalizar torneo' }));
    expect(await screen.findByText('Confirmar acción')).toBeInTheDocument();
    // Click Cancelar in modal
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancelar' });
    await userEvent.click(cancelButtons[cancelButtons.length - 1]);
    await waitFor(() => expect(screen.queryByText('Confirmar acción')).not.toBeInTheDocument());
  });

  it('no muestra tab Nueva ronda para torneo finalizado', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'finalizado', formato: 'COMMANDER' });
    rondasSvc.listarRondas.mockResolvedValue([]);
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.queryByRole('tab', { name: '+ Nueva ronda' })).not.toBeInTheDocument();
  });

  it('no muestra tab Nueva ronda para torneo cancelado', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'cancelado', formato: 'COMMANDER' });
    rondasSvc.listarRondas.mockResolvedValue([]);
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    expect(screen.queryByRole('tab', { name: '+ Nueva ronda' })).not.toBeInTheDocument();
  });

  it('cierra el modal de exito de ronda creada al aceptar', async () => {
    torneosSvc.obtenerTorneo.mockResolvedValue({ id: 1, nombre: 'Liga', estado: 'en_curso', formato: 'COMMANDER' });
    rondasSvc.crearRonda.mockResolvedValue({ id: 5, numero_ronda: 1 });
    wrap(<GestionTorneo />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Crear ronda' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Crear ronda' }));
    expect(await screen.findByText('Ronda creada')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }));
    await waitFor(() => expect(screen.queryByText('Ronda creada')).not.toBeInTheDocument());
  });
});
