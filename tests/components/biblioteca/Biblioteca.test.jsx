import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { authState, toast, bibliotecaSvc, mazosSvc } = vi.hoisted(() => ({
  authState: { value: {} },
  toast: { mostrarExito: vi.fn(), mostrarError: vi.fn() },
  bibliotecaSvc: { listarCartas: vi.fn(), listarSets: vi.fn() },
  mazosSvc: { listarMisMazos: vi.fn(), agregarCartaAMazo: vi.fn() },
}));

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('@/services/biblioteca.service', () => ({
  listarCartas: (...a) => bibliotecaSvc.listarCartas(...a),
  listarSets: (...a) => bibliotecaSvc.listarSets(...a),
}));
vi.mock('@/services/mazos.service', () => ({
  listarMisMazos: (...a) => mazosSvc.listarMisMazos(...a),
  agregarCartaAMazo: (...a) => mazosSvc.agregarCartaAMazo(...a),
}));

import Biblioteca from '@/modules/biblioteca/pages/Biblioteca';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  authState.value = { user: null, rol: null };
  bibliotecaSvc.listarSets.mockResolvedValue({ data: [] });
});

describe('Biblioteca', () => {
  it('muestra las cartas cargadas', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', imagen_url: 'http://x/img.png' }],
      pagination: { total: 1, total_pages: 1 },
    });
    wrap(<Biblioteca />);
    await waitFor(() => expect(screen.getByLabelText('Sol Ring')).toBeInTheDocument());
    expect(screen.getByText(/Mostrando 1–1 de 1/)).toBeInTheDocument();
  });

  it('muestra empty state sin cartas', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({ data: [], pagination: { total: 0, total_pages: 0 } });
    wrap(<Biblioteca />);
    await waitFor(() => expect(screen.getByText('Sin cartas')).toBeInTheDocument());
  });

  it('muestra error con reintentar', async () => {
    bibliotecaSvc.listarCartas.mockRejectedValue(new Error('falló'));
    wrap(<Biblioteca />);
    await waitFor(() => expect(screen.getByText('falló')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('abre el detalle de la carta al hacer click', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', texto: 'Agrega maná incoloro', imagen_url: 'http://x/img.png' }],
      pagination: { total: 1, total_pages: 1 },
    });
    wrap(<Biblioteca />);
    await userEvent.click(await screen.findByLabelText('Sol Ring'));
    expect(await screen.findByText('Agrega maná incoloro')).toBeInTheDocument();
  });

  it('permite a un jugador agregar la carta a un mazo', async () => {
    authState.value = { user: { id: 1 }, rol: 'jugador' };
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', scryfall_id: 's1', imagen_url: 'http://x/img.png' }],
      pagination: { total: 1, total_pages: 1 },
    });
    mazosSvc.listarMisMazos.mockResolvedValue([{ id: 10, nombre: 'Atraxa' }]);
    mazosSvc.agregarCartaAMazo.mockResolvedValue({});
    wrap(<Biblioteca />);
    await userEvent.click(await screen.findByLabelText('Sol Ring'));
    await userEvent.click(await screen.findByRole('button', { name: 'Agregar' }));
    await waitFor(() => expect(mazosSvc.agregarCartaAMazo).toHaveBeenCalledWith('10', expect.objectContaining({ scryfallId: 's1' })));
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('navega entre páginas con la paginación', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', imagen_url: 'http://x/img.png' }],
      pagination: { total: 80, total_pages: 2 },
    });
    wrap(<Biblioteca />);
    await waitFor(() => expect(screen.getByLabelText('Página siguiente')).toBeInTheDocument());
    await userEvent.click(screen.getByLabelText('Página siguiente'));
    await waitFor(() => expect(bibliotecaSvc.listarCartas).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })));
  });
});
