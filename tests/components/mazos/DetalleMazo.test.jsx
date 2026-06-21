import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { navigate, toast, mazosSvc } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: { mostrarExito: vi.fn(), mostrarError: vi.fn() },
  mazosSvc: { obtenerMazo: vi.fn(), validarMazo: vi.fn(), actualizarMazo: vi.fn() },
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigate,
  useParams: () => ({ id: '1' }),
}));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('@/services/mazos.service', () => ({
  obtenerMazo: (...a) => mazosSvc.obtenerMazo(...a),
  validarMazo: (...a) => mazosSvc.validarMazo(...a),
  actualizarMazo: (...a) => mazosSvc.actualizarMazo(...a),
}));
vi.mock('@/modules/mazos/components/ModoEdicionMazo', () => ({
  ModoEdicionMazo: ({ onSalir }) => <button onClick={onSalir}>Salir edición stub</button>,
}));

import DetalleMazo from '@/modules/mazos/pages/DetalleMazo';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  mazosSvc.validarMazo.mockResolvedValue({ valido: true, reglas: [], advertencias: [] });
});

describe('DetalleMazo', () => {
  it('muestra el detalle con lista y estadísticas', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Atraxa', formato: 'COMMANDER',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'Llanowar Elves', tipo: 'Creature — Elf' } }],
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Atraxa')).toBeInTheDocument());
    expect(screen.getByText('Criaturas')).toBeInTheDocument();
  });

  it('muestra empty state cuando el mazo no tiene cartas', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({ id: 1, nombre: 'Vacío', formato: 'COMMANDER', cartas: [] });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Tu mazo está vacío')).toBeInTheDocument());
  });

  it('muestra error al fallar la carga', async () => {
    mazosSvc.obtenerMazo.mockRejectedValue(new Error('no existe'));
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('no existe')).toBeInTheDocument());
  });

  it('entra en modo edición desde el empty state', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({ id: 1, nombre: 'Vacío', formato: 'COMMANDER', cartas: [] });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Tu mazo está vacío')).toBeInTheDocument());
    // El header y el empty state comparten el nombre accesible "Editar mazo"
    await userEvent.click(screen.getAllByRole('button', { name: 'Editar mazo' })[0]);
    expect(screen.getByText('Salir edición stub')).toBeInTheDocument();
  });

  it('guarda los cambios de metadata', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Atraxa', formato: 'COMMANDER',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'X', tipo: 'Creature' } }],
    });
    mazosSvc.actualizarMazo.mockResolvedValue({});
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Atraxa')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar mazo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(mazosSvc.actualizarMazo).toHaveBeenCalled());
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('notifica error si falla el guardado de metadata', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Atraxa', formato: 'COMMANDER',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'X', tipo: 'Creature' } }],
    });
    mazosSvc.actualizarMazo.mockRejectedValue(new Error('falló guardar'));
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Atraxa')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar mazo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
  });

  it('muestra botón Reintentar en error y recarga al hacer clic', async () => {
    mazosSvc.obtenerMazo.mockRejectedValueOnce(new Error('fallo red'));
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('fallo red')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    // Configure successful response for retry
    mazosSvc.obtenerMazo.mockResolvedValueOnce({
      id: 1, nombre: 'Recuperado', formato: 'COMMANDER', cartas: [],
    });
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByText('Recuperado')).toBeInTheDocument());
  });

  it('renderiza ModoEdicionMazo al entrar en edición con cartas', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Deck', formato: 'COMMANDER',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'Sol Ring', tipo: 'Artifact' } }],
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Deck')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar mazo' }));
    expect(screen.getByText('Salir edición stub')).toBeInTheDocument();
  });

  it('sale de edición y recarga al hacer clic en salir del stub', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Deck', formato: 'COMMANDER',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'Sol Ring', tipo: 'Artifact' } }],
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Deck')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar mazo' }));
    expect(screen.getByText('Salir edición stub')).toBeInTheDocument();
    // Reconfigure for reload
    mazosSvc.obtenerMazo.mockResolvedValueOnce({
      id: 1, nombre: 'Deck', formato: 'COMMANDER',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'Sol Ring', tipo: 'Artifact' } }],
    });
    await userEvent.click(screen.getByText('Salir edición stub'));
    await waitFor(() => expect(mazosSvc.obtenerMazo).toHaveBeenCalledTimes(2));
  });

  it('navega a /mazos al hacer clic en Volver', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({ id: 1, nombre: 'Test', formato: 'COMMANDER', cartas: [] });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Test')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Volver a mis mazos' }));
    expect(navigate).toHaveBeenCalledWith('/mazos');
  });

  it('muestra autor y fecha cuando están presentes', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Deck', formato: 'COMMANDER',
      usuario: { nombre_usuario: 'player1' },
      updatedAt: '2026-01-15T00:00:00Z',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'X', tipo: 'Creature' } }],
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Deck')).toBeInTheDocument());
    expect(screen.getByText(/por player1/)).toBeInTheDocument();
  });

  it('muestra descripción cuando el mazo la tiene', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Deck', formato: 'COMMANDER',
      descripcion: 'Mi mazo favorito',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'X', tipo: 'Creature' } }],
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Mi mazo favorito')).toBeInTheDocument());
  });

  it('maneja datos con formato MazoCartas anidado', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      mazo: {
        id: 1, nombre: 'Nested', formato: 'COMMANDER',
        MazoCartas: [
          { cantidad: 1, es_comandante: true, Carta: { id: 10, scryfall_id: 'sc1', nombre: 'Cmdr', tipo: 'Legendary' } },
        ],
      },
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Nested')).toBeInTheDocument());
  });

  it('abre el modal de zoom al hacer clic en una carta', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Deck', formato: 'COMMANDER',
      cartas: [{
        id: 1, scryfallId: 's1', cantidad: 1, esComandante: false,
        carta: { nombre: 'Llanowar Elves', tipo: 'Creature — Elf', costo_mana: '{G}', texto: 'Tap: Add {G}.', imagen_url: 'https://img.example.com/llanowar.jpg' },
      }],
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Deck')).toBeInTheDocument());
    // DeckList renders buttons for each carta when onCartaClick is provided
    const cartaBtns = screen.getAllByRole('button');
    const cartaBtn = cartaBtns.find((b) => b.closest('.deck-list__entrada-info'));
    if (cartaBtn) await userEvent.click(cartaBtn);
    // Modal should show carta zoom image (distinct from the thumbnail)
    await waitFor(() => {
      const zoomImg = document.querySelector('.detalle-mazo__zoom-img');
      expect(zoomImg).toBeInTheDocument();
    });
  });

  it('muestra placeholder en zoom cuando la carta no tiene imagen', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Deck', formato: 'COMMANDER',
      cartas: [{
        id: 1, scryfallId: 's1', cantidad: 1, esComandante: true,
        carta: { nombre: 'Cmdr Test', tipo: 'Legendary Creature', fuerza: 3, resistencia: 3 },
      }],
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Deck')).toBeInTheDocument());
    const cartaBtns = screen.getAllByRole('button');
    const cartaBtn = cartaBtns.find((b) => b.closest('.deck-list__entrada-info'));
    if (cartaBtn) await userEvent.click(cartaBtn);
    await waitFor(() => {
      const placeholder = document.querySelector('.detalle-mazo__zoom-placeholder');
      expect(placeholder).toBeInTheDocument();
    });
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(document.querySelector('.detalle-mazo__zoom-cmdr')).toBeInTheDocument();
  });

  it('muestra panel de edicion meta con nombre y switch publico', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'EditMe', formato: 'COMMANDER', publico: false,
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'X', tipo: 'Creature' } }],
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('EditMe')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar mazo' }));
    // In edit mode the meta panel shows
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });
});
