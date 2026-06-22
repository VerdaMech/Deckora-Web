import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartaDetalleModal } from '@/components/domain/CartaDetalleModal';

const carta = {
  nombre: 'Atraxa, Praetors’ Voice',
  tipo: 'Legendary Creature — Phyrexian Angel Horror',
  costo_mana: '{G}{W}{U}{B}',
  texto: 'Vuela, vínculo vital',
  fuerza: 4,
  resistencia: 4,
  set_nombre: 'Commander 2016',
  legalities: { commander: 'legal', standard: 'not_legal' },
};

describe('CartaDetalleModal', () => {
  it('no renderiza nada sin carta', () => {
    const { container } = render(<CartaDetalleModal carta={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra nombre, tipo, texto y P/T', () => {
    render(<CartaDetalleModal carta={carta} onClose={vi.fn()} />);
    expect(screen.getAllByText(/Atraxa/).length).toBeGreaterThan(0);
    expect(screen.getByText(carta.tipo)).toBeInTheDocument();
    expect(screen.getByText('4 / 4')).toBeInTheDocument();
  });

  it('muestra el set y las legalidades', () => {
    render(<CartaDetalleModal carta={carta} onClose={vi.fn()} />);
    expect(screen.getByText('Commander 2016')).toBeInTheDocument();
    expect(screen.getByText('Legalidades')).toBeInTheDocument();
    expect(screen.getAllByText('Legal').length).toBeGreaterThan(0);
  });

  it('llama onClose al cerrar', async () => {
    const onClose = vi.fn();
    render(<CartaDetalleModal carta={carta} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
