import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { svc } = vi.hoisted(() => ({
  svc: {
    agregarCartaAMazo: vi.fn(),
    actualizarCartaEnMazo: vi.fn(),
    eliminarCartaDeMazo: vi.fn(),
    validarMazo: vi.fn(),
    autocompletarMazo: vi.fn(),
    obtenerMazo: vi.fn(),
    getRecomendaciones: vi.fn(),
  },
}));

vi.mock('@/services/mazos.service', () => ({
  agregarCartaAMazo: (...a) => svc.agregarCartaAMazo(...a),
  actualizarCartaEnMazo: (...a) => svc.actualizarCartaEnMazo(...a),
  eliminarCartaDeMazo: (...a) => svc.eliminarCartaDeMazo(...a),
  validarMazo: (...a) => svc.validarMazo(...a),
  autocompletarMazo: (...a) => svc.autocompletarMazo(...a),
  obtenerMazo: (...a) => svc.obtenerMazo(...a),
  getRecomendaciones: (...a) => svc.getRecomendaciones(...a),
}));
vi.mock('@/services/cartas.service', () => ({ buscarCartas: vi.fn().mockResolvedValue([]) }));

// DeckBuilder stub que expone los handlers como botones
vi.mock('@/components/domain', () => ({
  DeckBuilder: ({ onAgregarCarta, onCantidadChange, onEliminar, onMarcarComandante, onDesmarcarComandante, onAutocompletar, cartas }) => (
    <div>
      <span>cartas:{cartas.length}</span>
      <button onClick={() => onAgregarCarta({ id: 'c1', scryfall_id: 's1', type_line: 'Artifact' })}>add</button>
      <button onClick={() => onCantidadChange({ scryfallId: 's1', cantidad: 1 }, 3)}>qty</button>
      <button onClick={() => onEliminar({ scryfallId: 's1' })}>del</button>
      <button onClick={() => onMarcarComandante({ scryfallId: 's1' })}>mark</button>
      <button onClick={() => onDesmarcarComandante({ scryfallId: 's1' })}>unmark</button>
      <button onClick={() => onAutocompletar()}>auto</button>
    </div>
  ),
}));

import { ModoEdicionMazo } from '@/modules/mazos/components/ModoEdicionMazo';

const mazo = { id: 1, formato: 'COMMANDER', cartas: [] };

beforeEach(() => {
  vi.clearAllMocks();
  svc.validarMazo.mockResolvedValue({ valido: true, reglas: [], advertencias: [] });
  svc.agregarCartaAMazo.mockResolvedValue({});
  svc.actualizarCartaEnMazo.mockResolvedValue({});
  svc.eliminarCartaDeMazo.mockResolvedValue({});
});

describe('ModoEdicionMazo', () => {
  it('renderiza la toolbar y sale de edición', async () => {
    const onSalir = vi.fn();
    render(<ModoEdicionMazo mazo={mazo} onSalir={onSalir} />);
    expect(screen.getByText('Modo edición')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /confirmar edición/i }));
    expect(onSalir).toHaveBeenCalled();
  });

  it('agrega una carta llamando al servicio', async () => {
    render(<ModoEdicionMazo mazo={mazo} onSalir={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'add' }));
    await waitFor(() => expect(svc.agregarCartaAMazo).toHaveBeenCalledWith(1, expect.objectContaining({ scryfallId: 's1' })));
  });

  it('actualiza la cantidad y elimina cartas', async () => {
    render(<ModoEdicionMazo mazo={{ ...mazo, cartas: [{ id: 'c1', scryfallId: 's1', cantidad: 1, carta: {} }] }} onSalir={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'qty' }));
    await waitFor(() => expect(svc.actualizarCartaEnMazo).toHaveBeenCalledWith(1, 's1', { cantidad: 3 }));
    await userEvent.click(screen.getByRole('button', { name: 'del' }));
    await waitFor(() => expect(svc.eliminarCartaDeMazo).toHaveBeenCalledWith(1, 's1'));
  });

  it('marca y desmarca el comandante', async () => {
    render(<ModoEdicionMazo mazo={{ ...mazo, cartas: [{ id: 'c1', scryfallId: 's1', cantidad: 1, carta: {} }] }} onSalir={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'mark' }));
    await waitFor(() => expect(svc.actualizarCartaEnMazo).toHaveBeenCalledWith(1, 's1', { esComandante: true }));
  });

  it('revierte y avisa cuando agregar carta falla', async () => {
    svc.agregarCartaAMazo.mockRejectedValue(new Error('sin red'));
    render(<ModoEdicionMazo mazo={mazo} onSalir={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'add' }));
    expect(await screen.findByText(/no se pudo agregar la carta/i)).toBeInTheDocument();
  });

  it('revierte la cantidad y avisa si la actualización falla', async () => {
    svc.actualizarCartaEnMazo.mockRejectedValue(new Error('sin red'));
    render(<ModoEdicionMazo mazo={{ ...mazo, cartas: [{ id: 'c1', scryfallId: 's1', cantidad: 1, carta: {} }] }} onSalir={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'qty' }));
    expect(await screen.findByText(/no se pudo actualizar la cantidad/i)).toBeInTheDocument();
  });

  it('revierte la eliminación y avisa si falla', async () => {
    svc.eliminarCartaDeMazo.mockRejectedValue(new Error('sin red'));
    render(<ModoEdicionMazo mazo={{ ...mazo, cartas: [{ id: 'c1', scryfallId: 's1', cantidad: 1, carta: {} }] }} onSalir={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'del' }));
    expect(await screen.findByText(/no se pudo eliminar la carta/i)).toBeInTheDocument();
  });

  it('autocompleta el mazo usando los servicios', async () => {
    svc.autocompletarMazo.mockResolvedValue({});
    svc.obtenerMazo.mockResolvedValue({ cartas: [{ id: 'c1', scryfallId: 's1', cantidad: 100, esComandante: false, carta: {} }] });
    render(<ModoEdicionMazo mazo={mazo} onSalir={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'auto' }));
    await waitFor(() => expect(svc.autocompletarMazo).toHaveBeenCalledWith(1));
    expect(svc.obtenerMazo).toHaveBeenCalled();
  });
});
