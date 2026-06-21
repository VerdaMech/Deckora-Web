import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

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
});
