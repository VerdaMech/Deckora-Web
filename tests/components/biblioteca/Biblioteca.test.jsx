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

  it('muestra detalles completos en el modal de zoom', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{
        id: 1, nombre: 'Lightning Bolt', tipo: 'Instant', texto: 'Deals 3 damage',
        costo_mana: '{R}', imagen_url: 'http://x/bolt.png',
        fuerza: null, resistencia: null,
        set_nombre: 'Alpha', set_fecha_lanzamiento: '1993-08-05',
        legalities: { standard: 'not_legal', commander: 'legal', modern: 'legal', legacy: 'legal', pioneer: 'not_legal', vintage: 'restricted', pauper: 'legal', historic: 'not_legal', explorer: 'not_legal', alchemy: 'not_legal', brawl: 'banned' },
        scryfall_id: 'sc1',
      }],
      pagination: { total: 1, total_pages: 1 },
    });
    wrap(<Biblioteca />);
    await userEvent.click(await screen.findByLabelText('Lightning Bolt'));
    // Verify modal content
    await waitFor(() => expect(screen.getByText('Deals 3 damage')).toBeInTheDocument());
    expect(screen.getByText('Instant')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Legalidades')).toBeInTheDocument();
    // Check that legality badges render
    expect(screen.getAllByText('Legal').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Restringida')).toBeInTheDocument();
    expect(screen.getByText('Prohibida')).toBeInTheDocument();
  });

  it('muestra fuerza/resistencia cuando la carta es criatura', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{
        id: 1, nombre: 'Grizzly Bears', tipo: 'Creature', imagen_url: 'http://x/bear.png',
        fuerza: 2, resistencia: 2,
      }],
      pagination: { total: 1, total_pages: 1 },
    });
    wrap(<Biblioteca />);
    await userEvent.click(await screen.findByLabelText('Grizzly Bears'));
    await waitFor(() => expect(screen.getByText('2 / 2')).toBeInTheDocument());
  });

  it('muestra placeholder cuando la carta no tiene imagen', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{
        id: 1, nombre: 'No Image Card', tipo: 'Artifact', imagen_url: null,
      }],
      pagination: { total: 1, total_pages: 1 },
    });
    wrap(<Biblioteca />);
    const labels = await screen.findAllByLabelText('No Image Card');
    // Click the first one (the MTGCard wrapper with role="button")
    await userEvent.click(labels[0]);
    await waitFor(() => {
      const placeholder = document.querySelector('.biblioteca__zoom-placeholder');
      expect(placeholder).toBeInTheDocument();
    });
  });

  it('muestra la sección de agregar a mazo para jugadores autenticados', async () => {
    authState.value = { user: { id: 1 }, rol: 'jugador' };
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', scryfall_id: 's1', imagen_url: 'http://x/img.png' }],
      pagination: { total: 1, total_pages: 1 },
    });
    mazosSvc.listarMisMazos.mockResolvedValue([{ id: 10, nombre: 'Atraxa' }, { id: 11, nombre: 'Krenko' }]);
    wrap(<Biblioteca />);
    await userEvent.click(await screen.findByLabelText('Sol Ring'));
    await waitFor(() => expect(screen.getByText('Agregar a mazo')).toBeInTheDocument());
    expect(screen.getByLabelText('Seleccionar mazo')).toBeInTheDocument();
  });

  it('muestra mensaje cuando el jugador no tiene mazos', async () => {
    authState.value = { user: { id: 1 }, rol: 'jugador' };
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', imagen_url: 'http://x/img.png' }],
      pagination: { total: 1, total_pages: 1 },
    });
    mazosSvc.listarMisMazos.mockResolvedValue([]);
    wrap(<Biblioteca />);
    await userEvent.click(await screen.findByLabelText('Sol Ring'));
    await waitFor(() => expect(screen.getByText('No tienes mazos creados.')).toBeInTheDocument());
  });

  it('muestra error al fallar agregarCartaAMazo', async () => {
    authState.value = { user: { id: 1 }, rol: 'jugador' };
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', scryfall_id: 's1', imagen_url: 'http://x/img.png' }],
      pagination: { total: 1, total_pages: 1 },
    });
    mazosSvc.listarMisMazos.mockResolvedValue([{ id: 10, nombre: 'Atraxa' }]);
    mazosSvc.agregarCartaAMazo.mockRejectedValue(new Error('Duplicado'));
    wrap(<Biblioteca />);
    await userEvent.click(await screen.findByLabelText('Sol Ring'));
    await userEvent.click(await screen.findByRole('button', { name: 'Agregar' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
  });

  it('filtra por set al cambiar el selector', async () => {
    bibliotecaSvc.listarSets.mockResolvedValue({ data: [{ anio: 2023, sets: [{ codigo: 'ONE', nombre: 'Phyrexia', cantidad_cartas: 100 }] }] });
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', imagen_url: 'http://x/img.png' }],
      pagination: { total: 1, total_pages: 1 },
    });
    wrap(<Biblioteca />);
    await waitFor(() => expect(screen.getByLabelText('Filtrar por set')).toBeInTheDocument());
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por set'), 'ONE');
    await waitFor(() => expect(bibliotecaSvc.listarCartas).toHaveBeenCalledWith(expect.objectContaining({ set_codigo: 'ONE' })));
  });

  it('navega a página anterior con el botón de paginación', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', imagen_url: 'http://x/img.png' }],
      pagination: { total: 120, total_pages: 3 },
    });
    render(
      <MemoryRouter initialEntries={['/?page=2']}>
        <Biblioteca />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByLabelText('Página anterior')).toBeInTheDocument());
    expect(screen.getByLabelText('Página anterior')).not.toBeDisabled();
  });

  it('reintenta la carga al hacer clic en Reintentar', async () => {
    bibliotecaSvc.listarCartas.mockRejectedValueOnce(new Error('Error'));
    wrap(<Biblioteca />);
    await waitFor(() => expect(screen.getByText('Error')).toBeInTheDocument());
    bibliotecaSvc.listarCartas.mockResolvedValueOnce({
      data: [{ id: 1, nombre: 'Recovered', tipo: 'Artifact', imagen_url: 'http://x/img.png' }],
      pagination: { total: 1, total_pages: 1 },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByLabelText('Recovered')).toBeInTheDocument());
  });

  it('muestra paginación con ellipsis para muchas páginas', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', imagen_url: 'http://x/img.png' }],
      pagination: { total: 400, total_pages: 10 },
    });
    wrap(<Biblioteca />);
    await waitFor(() => expect(screen.getByLabelText('Paginación')).toBeInTheDocument());
    // With 10 pages on page 1, getPaginas should show [1, 2, ..., 10] pattern
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  it('resalta la página actual en la paginación', async () => {
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', imagen_url: 'http://x/img.png' }],
      pagination: { total: 120, total_pages: 3 },
    });
    wrap(<Biblioteca />);
    await waitFor(() => expect(screen.getByLabelText('Paginación')).toBeInTheDocument());
    // Page 1 should have aria-current="page"
    expect(screen.getByText('1').closest('button')).toHaveAttribute('aria-current', 'page');
  });

  it('no muestra sección de agregar para usuarios no autenticados', async () => {
    authState.value = { user: null, rol: null };
    bibliotecaSvc.listarCartas.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', imagen_url: 'http://x/img.png' }],
      pagination: { total: 1, total_pages: 1 },
    });
    wrap(<Biblioteca />);
    await userEvent.click(await screen.findByLabelText('Sol Ring'));
    await waitFor(() => expect(screen.queryByText('Agregar a mazo')).not.toBeInTheDocument());
  });
});
