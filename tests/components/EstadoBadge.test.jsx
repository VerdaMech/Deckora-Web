import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EstadoBadge } from '@/components/domain/EstadoBadge';

describe('EstadoBadge', () => {
  it.each([
    ['pendiente', 'Pendiente', 'warning'],
    ['en_curso', 'En curso', 'info'],
    ['finalizado', 'Finalizado', 'success'],
    ['cancelado', 'Cancelado', 'muted'],
  ])('muestra "%s" como "%s" con su modificador de clase', (estado, etiqueta, modificador) => {
    render(<EstadoBadge estado={estado} />);
    const el = screen.getByText(etiqueta);
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass(`estado-badge--${modificador}`);
  });

  it('normaliza el estado en mayúsculas', () => {
    render(<EstadoBadge estado="PENDIENTE" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('muestra el estado crudo si es desconocido', () => {
    render(<EstadoBadge estado="archivado" />);
    expect(screen.getByText('archivado')).toBeInTheDocument();
  });

  it('no renderiza nada sin estado', () => {
    const { container } = render(<EstadoBadge estado={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
