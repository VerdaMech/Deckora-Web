import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBadge from '@/components/domain/RoleBadge';

describe('RoleBadge', () => {
  it.each([
    ['jugador', 'Jugador'],
    ['organizador', 'Organizador'],
    ['tienda', 'Tienda'],
  ])('muestra el rol %s como "%s"', (rol, etiqueta) => {
    render(<RoleBadge rol={rol} />);
    expect(screen.getByText(etiqueta)).toBeInTheDocument();
  });

  it('muestra el rol crudo si no está mapeado', () => {
    render(<RoleBadge rol="admin" />);
    expect(screen.getByText('admin')).toBeInTheDocument();
  });
});
