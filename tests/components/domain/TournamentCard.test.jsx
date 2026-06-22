import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TournamentCard } from '@/components/domain/TournamentCard';

const torneo = {
  nombre: 'Liga Commander',
  formato: 'COMMANDER',
  estado: 'pendiente',
  fecha_inicio: '2026-07-01',
  ubicacion: 'Santiago',
  inscritos_count: 8,
  cupo_maximo: 16,
};

describe('TournamentCard', () => {
  it('no renderiza nada si no hay torneo', () => {
    const { container } = render(<TournamentCard torneo={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra nombre, ubicación y cupo', () => {
    render(<TournamentCard torneo={torneo} />);
    expect(screen.getByText('Liga Commander')).toBeInTheDocument();
    expect(screen.getByText('Santiago')).toBeInTheDocument();
    expect(screen.getByText('8 / 16')).toBeInTheDocument();
  });

  it('oculta el cupo cuando ocultarCupo es true', () => {
    render(<TournamentCard torneo={torneo} ocultarCupo />);
    expect(screen.queryByText('8 / 16')).not.toBeInTheDocument();
  });

  it('dispara onClick y expone role button', async () => {
    const onClick = vi.fn();
    render(<TournamentCard torneo={torneo} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
