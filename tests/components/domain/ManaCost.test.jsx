import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ManaCost, OracleText } from '@/components/domain/ManaCost';

describe('ManaCost', () => {
  it('renderiza un símbolo por cada maná del costo', () => {
    const { container } = render(<ManaCost cost="{2}{U}{U}" />);
    expect(container.querySelectorAll('i.ms')).toHaveLength(3);
  });

  it('expone el símbolo como aria-label', () => {
    render(<ManaCost cost="{R}" />);
    expect(screen.getByLabelText('R')).toBeInTheDocument();
  });

  it('no renderiza nada cuando no hay símbolos', () => {
    const { container } = render(<ManaCost cost="" />);
    expect(container.firstChild).toBeNull();
  });
});

describe('OracleText', () => {
  it('intercala texto y símbolos de maná', () => {
    const { container } = render(<OracleText text="Agrega {G}{G} a tu reserva" />);
    expect(container.querySelectorAll('i.ms')).toHaveLength(2);
    expect(container).toHaveTextContent('Agrega');
    expect(container).toHaveTextContent('a tu reserva');
  });

  it('devuelve null con texto vacío', () => {
    const { container } = render(<OracleText text="" />);
    expect(container.firstChild).toBeNull();
  });

  it('respeta los saltos de línea', () => {
    const { container } = render(<OracleText text={'línea 1\nlínea 2'} />);
    expect(container.querySelectorAll('br')).toHaveLength(1);
  });
});
