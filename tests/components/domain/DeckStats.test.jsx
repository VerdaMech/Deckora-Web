import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeckStats } from '@/components/domain/DeckStats';

const cartas = [
  { cantidad: 4, carta: { tipo: 'Creature — Elf', cmc: 1, colors: ['G'] } },
  { cantidad: 2, carta: { tipo: 'Instant', cmc: 2, colors: ['U'] } },
  { cantidad: 20, carta: { tipo: 'Basic Land — Forest', cmc: 0 } },
];

describe('DeckStats', () => {
  it('muestra el empty state cuando no hay cartas', () => {
    render(<DeckStats cartas={[]} />);
    expect(screen.getByText('Sin estadísticas')).toBeInTheDocument();
  });

  it('muestra el total y el límite del formato', () => {
    render(<DeckStats cartas={cartas} formato="COMMANDER" />);
    expect(screen.getByText('26')).toBeInTheDocument(); // 4 + 2 + 20
    expect(screen.getByText('/ 100')).toBeInTheDocument();
  });

  it('renderiza los títulos de los gráficos', () => {
    render(<DeckStats cartas={cartas} formato="STANDARD" />);
    expect(screen.getByText('Curva de maná')).toBeInTheDocument();
    expect(screen.getByText('Identidad de color')).toBeInTheDocument();
    expect(screen.getByText('Por tipos')).toBeInTheDocument();
  });

  it('usa límite 60 para formatos no Commander', () => {
    render(<DeckStats cartas={cartas} formato="MODERN" />);
    expect(screen.getByText('/ 60')).toBeInTheDocument();
  });
});
