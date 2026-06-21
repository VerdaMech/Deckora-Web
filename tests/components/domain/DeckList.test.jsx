import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeckList } from '@/components/domain/DeckList';

const cartas = [
  { id: 1, cantidad: 2, carta: { nombre: 'Llanowar Elves', tipo: 'Creature — Elf', mana_cost: '{G}' } },
  { id: 2, cantidad: 10, carta: { nombre: 'Forest', tipo: 'Basic Land — Forest' } },
];

describe('DeckList', () => {
  it('muestra mensaje cuando el mazo está vacío', () => {
    render(<DeckList cartas={[]} />);
    expect(screen.getByText(/no tiene cartas aún/i)).toBeInTheDocument();
  });

  it('agrupa las cartas por tipo con su encabezado', () => {
    render(<DeckList cartas={cartas} />);
    expect(screen.getByText('Criaturas')).toBeInTheDocument();
    expect(screen.getByText('Tierras')).toBeInTheDocument();
  });

  it('en modo lectura muestra la cantidad con ×', () => {
    render(<DeckList cartas={cartas} />);
    expect(screen.getByText('×2')).toBeInTheDocument();
    expect(screen.getByText('×10')).toBeInTheDocument();
  });

  it('en modo editable permite aumentar y eliminar', async () => {
    const onCantidadChange = vi.fn();
    const onEliminar = vi.fn();
    render(
      <DeckList cartas={cartas} editable onCantidadChange={onCantidadChange} onEliminar={onEliminar} />,
    );
    await userEvent.click(screen.getAllByLabelText('Aumentar cantidad')[0]);
    expect(onCantidadChange).toHaveBeenCalled();
    await userEvent.click(screen.getAllByLabelText('Eliminar carta')[0]);
    expect(onEliminar).toHaveBeenCalled();
  });

  it('dispara onCartaClick al hacer click en la entrada', async () => {
    const onCartaClick = vi.fn();
    render(<DeckList cartas={cartas} onCartaClick={onCartaClick} />);
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(onCartaClick).toHaveBeenCalled();
  });
});
