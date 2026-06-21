import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/services/cartas.service', () => ({ buscarCartas: vi.fn().mockResolvedValue([]) }));
vi.mock('@/services/mazos.service', () => ({ getRecomendaciones: vi.fn(), importarMazo: vi.fn() }));

import { DeckBuilder } from '@/components/domain/DeckBuilder';

const mazo = { id: 1, formato: 'COMMANDER' };
const baseProps = {
  mazo,
  validacion: null,
  validacionCargando: false,
  comandanteId: null,
  onAgregarCarta: vi.fn(),
  onCantidadChange: vi.fn(),
  onEliminar: vi.fn(),
  onMarcarComandante: vi.fn(),
  onDesmarcarComandante: vi.fn(),
  onAplicarSugerencia: vi.fn(),
  onAutocompletar: vi.fn(),
  onMazoImportado: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

describe('DeckBuilder', () => {
  it('muestra las columnas de armado', () => {
    render(<DeckBuilder {...baseProps} cartas={[]} />);
    expect(screen.getByText('Agregar cartas')).toBeInTheDocument();
    expect(screen.getByText('Lista del mazo')).toBeInTheDocument();
    expect(screen.getByText('Validación')).toBeInTheDocument();
    expect(screen.getByText('Estadísticas')).toBeInTheDocument();
    expect(screen.getByText('Asistente IA')).toBeInTheDocument();
  });

  it('muestra mensaje cuando la lista está vacía', () => {
    render(<DeckBuilder {...baseProps} cartas={[]} />);
    expect(screen.getByText(/busca tu primera carta/i)).toBeInTheDocument();
  });

  it('renderiza la lista cuando hay cartas', () => {
    const cartas = [{ id: 1, cantidad: 1, carta: { nombre: 'Llanowar Elves', tipo: 'Creature — Elf' } }];
    render(<DeckBuilder {...baseProps} cartas={cartas} />);
    expect(screen.getByText('Criaturas')).toBeInTheDocument();
  });

  it('abre CartaDetalleModal al hacer clic en una carta', async () => {
    const cartas = [{ id: 1, cantidad: 1, carta: { nombre: 'Llanowar Elves', tipo: 'Creature — Elf' } }];
    const { container } = render(<DeckBuilder {...baseProps} cartas={cartas} />);
    const entradaInfo = container.querySelector('.deck-list__entrada-info[role="button"]');
    await userEvent.click(entradaInfo);
    await waitFor(() => {
      const title = document.querySelector('.modal-title-custom');
      expect(title).not.toBeNull();
      expect(title.textContent).toBe('Llanowar Elves');
    });
  });

  it('cierra CartaDetalleModal al invocar onClose', async () => {
    const cartas = [{ id: 1, cantidad: 1, carta: { nombre: 'Llanowar Elves', tipo: 'Creature — Elf' } }];
    const { container } = render(<DeckBuilder {...baseProps} cartas={cartas} />);
    await userEvent.click(container.querySelector('.deck-list__entrada-info[role="button"]'));
    await waitFor(() => {
      expect(document.querySelector('.modal-title-custom')).not.toBeNull();
    });
    await userEvent.click(screen.getByLabelText('Cerrar'));
    await waitFor(() => {
      expect(document.querySelector('.modal-title-custom')).toBeNull();
    });
  });
});
