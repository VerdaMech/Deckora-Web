import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { navigate, toast, mazosSvc, torneosSvc } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: { mostrarExito: vi.fn(), mostrarError: vi.fn() },
  mazosSvc: { listarMisMazos: vi.fn() },
  torneosSvc: {
    inscribirseATorneo: vi.fn(),
    cancelarInscripcion: vi.fn(),
    listarPendientes: vi.fn(),
    aprobarInscripcion: vi.fn(),
    rechazarInscripcion: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('@/services/mazos.service', () => ({ listarMisMazos: (...a) => mazosSvc.listarMisMazos(...a) }));
vi.mock('@/services/torneos.service', () => ({
  inscribirseATorneo: (...a) => torneosSvc.inscribirseATorneo(...a),
  cancelarInscripcion: (...a) => torneosSvc.cancelarInscripcion(...a),
  listarPendientes: (...a) => torneosSvc.listarPendientes(...a),
  aprobarInscripcion: (...a) => torneosSvc.aprobarInscripcion(...a),
  rechazarInscripcion: (...a) => torneosSvc.rechazarInscripcion(...a),
}));
vi.mock('@/modules/torneos/components/SnapshotMazoModal', () => ({ default: () => <div data-testid="snapshot" /> }));

import PanelInscripcion from '@/modules/torneos/components/PanelInscripcion';
import BandejaInscripciones from '@/modules/torneos/components/BandejaInscripciones';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);
const torneoPendiente = { id: 1, nombre: 'Liga', estado: 'pendiente', formato: 'COMMANDER', cupo_maximo: 16, inscritos_count: 2 };

beforeEach(() => vi.clearAllMocks());

describe('PanelInscripcion', () => {
  it('invita a iniciar sesión cuando no hay usuario', () => {
    wrap(<PanelInscripcion torneo={torneoPendiente} usuario={null} inscripcionPropia={null} />);
    expect(screen.getByRole('button', { name: /iniciá sesión/i })).toBeInTheDocument();
  });

  it('avisa que solo jugadores se inscriben para otros roles que no sean org/tienda', () => {
    wrap(<PanelInscripcion torneo={torneoPendiente} usuario={{ id: 2, rol: 'otro' }} inscripcionPropia={null} />);
    expect(screen.getByText(/solo los jugadores pueden inscribirse/i)).toBeInTheDocument();
  });

  it('permite al jugador seleccionar mazo e inscribirse', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([{ id: 10, nombre: 'Atraxa', formato: 'COMMANDER' }]);
    torneosSvc.inscribirseATorneo.mockResolvedValue({});
    const onInscribirse = vi.fn();
    wrap(<PanelInscripcion torneo={torneoPendiente} usuario={{ id: 2, rol: 'jugador' }} inscripcionPropia={null} onInscribirse={onInscribirse} />);
    await waitFor(() => expect(screen.getByRole('option', { name: 'Atraxa' })).toBeInTheDocument());
    await userEvent.selectOptions(screen.getByRole('combobox'), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Solicitar inscripción' }));
    await waitFor(() => expect(torneosSvc.inscribirseATorneo).toHaveBeenCalledWith(1, { mazoId: '10' }));
    expect(onInscribirse).toHaveBeenCalled();
  });

  it('muestra estado inscrito y permite cancelar', async () => {
    torneosSvc.cancelarInscripcion.mockResolvedValue({});
    const onCancelar = vi.fn();
    wrap(
      <PanelInscripcion
        torneo={torneoPendiente}
        usuario={{ id: 2, rol: 'jugador' }}
        inscripcionPropia={{ id: 5, confirmado: true, mazo: { nombre: 'Atraxa' } }}
        onCancelar={onCancelar}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar inscripción' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar cancelación' }));
    await waitFor(() => expect(torneosSvc.cancelarInscripcion).toHaveBeenCalledWith(1, 5));
  });

  it('indica inscripciones cerradas si el torneo no está pendiente', () => {
    wrap(<PanelInscripcion torneo={{ ...torneoPendiente, estado: 'finalizado' }} usuario={{ id: 2, rol: 'jugador' }} inscripcionPropia={null} />);
    expect(screen.getByText(/este torneo ya finalizó/i)).toBeInTheDocument();
  });

  it('indica cupo completo cuando no hay lugares', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([]);
    wrap(<PanelInscripcion torneo={{ ...torneoPendiente, cupo_maximo: 2, inscritos_count: 2 }} usuario={{ id: 2, rol: 'jugador' }} inscripcionPropia={null} />);
    expect(await screen.findByText('Cupo completo')).toBeInTheDocument();
  });

  it('avisa cuando el jugador no tiene mazos del formato', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([]);
    wrap(<PanelInscripcion torneo={torneoPendiente} usuario={{ id: 2, rol: 'jugador' }} inscripcionPropia={null} />);
    await waitFor(() => expect(screen.getByText(/no tenés mazos en formato/i)).toBeInTheDocument());
  });

  it('no muestra panel para organizadores', () => {
    const { container } = wrap(<PanelInscripcion torneo={torneoPendiente} usuario={{ id: 2, rol: 'organizador' }} inscripcionPropia={null} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('BandejaInscripciones', () => {
  it('no renderiza nada sin torneos', () => {
    const { container } = render(<BandejaInscripciones torneos={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('lista solicitudes y permite aprobar', async () => {
    torneosSvc.listarPendientes.mockResolvedValue([
      { id: 7, Jugador: { Usuario: { nombre_usuario: 'ana' } }, Mazo: { nombre: 'Atraxa' } },
    ]);
    torneosSvc.aprobarInscripcion.mockResolvedValue({});
    render(<BandejaInscripciones torneos={[{ id: 1, nombre: 'Liga' }]} />);
    await waitFor(() => expect(screen.getByText('ana')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Aprobar' }));
    await waitFor(() => expect(torneosSvc.aprobarInscripcion).toHaveBeenCalledWith(1, 7));
  });

  it('muestra mensaje cuando no hay solicitudes', async () => {
    torneosSvc.listarPendientes.mockResolvedValue([]);
    render(<BandejaInscripciones torneos={[{ id: 1, nombre: 'Liga' }]} />);
    await waitFor(() => expect(screen.getByText('No hay solicitudes pendientes.')).toBeInTheDocument());
  });
});
