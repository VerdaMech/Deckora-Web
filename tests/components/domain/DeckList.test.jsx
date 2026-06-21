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

  it('muestra botón de reducir cantidad y lo deshabilita cuando es 1', () => {
    const cartaConCantidad1 = [
      { id: 1, cantidad: 1, carta: { nombre: 'Llanowar Elves', tipo: 'Creature', mana_cost: '{G}' } },
    ];
    render(<DeckList cartas={cartaConCantidad1} editable onCantidadChange={vi.fn()} onEliminar={vi.fn()} />);
    const reducirBtn = screen.getByLabelText('Reducir cantidad');
    expect(reducirBtn).toBeDisabled();
  });

  it('permite reducir la cantidad cuando es mayor a 1', async () => {
    const cartaConCantidad3 = [
      { id: 1, cantidad: 3, carta: { nombre: 'Llanowar Elves', tipo: 'Creature', mana_cost: '{G}' } },
    ];
    const onCantidadChange = vi.fn();
    render(<DeckList cartas={cartaConCantidad3} editable onCantidadChange={onCantidadChange} onEliminar={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Reducir cantidad'));
    expect(onCantidadChange).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), 2);
  });

  it('muestra botón de marcar como comandante para criaturas legendarias en Commander', () => {
    const cartaCmdr = [
      { id: 1, cantidad: 1, esComandante: false, carta: { nombre: 'Atraxa', tipo: 'Legendary Creature — Angel', type_line: 'Legendary Creature — Angel', mana_cost: '{1}{G}' } },
    ];
    render(
      <DeckList
        cartas={cartaCmdr}
        formato="COMMANDER"
        editable
        onCantidadChange={vi.fn()}
        onEliminar={vi.fn()}
        onMarcarComandante={vi.fn()}
        onDesmarcarComandante={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Marcar como comandante')).toBeInTheDocument();
  });

  it('muestra botón de quitar como comandante cuando es comandante', () => {
    const cartaCmdr = [
      { id: 1, cantidad: 1, esComandante: true, carta: { nombre: 'Atraxa', tipo: 'Legendary Creature', type_line: 'Legendary Creature', mana_cost: '{1}{G}' } },
    ];
    render(
      <DeckList
        cartas={cartaCmdr}
        formato="COMMANDER"
        editable
        onCantidadChange={vi.fn()}
        onEliminar={vi.fn()}
        onMarcarComandante={vi.fn()}
        onDesmarcarComandante={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Quitar como comandante')).toBeInTheDocument();
  });

  it('muestra nombre y mana cost en modo editable', () => {
    const cartaEdit = [
      { id: 1, cantidad: 1, carta: { nombre: 'Sol Ring', tipo: 'Artifact', mana_cost: '{1}' } },
    ];
    render(<DeckList cartas={cartaEdit} editable onCantidadChange={vi.fn()} onEliminar={vi.fn()} />);
    expect(screen.getByText('Sol Ring')).toBeInTheDocument();
  });

  it('dispara onCartaClick al presionar Enter en la entrada', async () => {
    const onCartaClick = vi.fn();
    render(<DeckList cartas={cartas} onCartaClick={onCartaClick} />);
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    await userEvent.keyboard('{Enter}');
    expect(onCartaClick).toHaveBeenCalled();
  });
});
