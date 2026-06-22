import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoundView } from '@/components/domain/RoundView';

describe('RoundView', () => {
  it('no renderiza nada sin ronda', () => {
    const { container } = render(<RoundView ronda={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra número, tipo y mensaje vacío si no hay mesas', () => {
    render(<RoundView ronda={{ numero: 1, tipo: 'swiss', estado: 'en_curso', enfrentamientos: [] }} />);
    expect(screen.getByText('Ronda 1')).toBeInTheDocument();
    expect(screen.getByText('Swiss')).toBeInTheDocument();
    expect(screen.getByText(/sin mesas asignadas/i)).toBeInTheDocument();
  });

  it('renderiza una PodTable por enfrentamiento', () => {
    render(
      <RoundView
        ronda={{
          numero: 2,
          tipo: 'final',
          estado: 'en_curso',
          enfrentamientos: [
            { id: 1, numero_mesa: 1, participantes: [] },
            { id: 2, numero_mesa: 2, participantes: [] },
          ],
        }}
      />,
    );
    expect(screen.getByText('Mesa 1')).toBeInTheDocument();
    expect(screen.getByText('Mesa 2')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });
});
