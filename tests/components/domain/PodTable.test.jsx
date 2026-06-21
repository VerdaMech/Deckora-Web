import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PodTable } from '@/components/domain/PodTable';

const enfrentamiento = {
  numero_mesa: 3,
  estado: 'en_curso',
  participantes: [
    { id: 1, nombre_usuario: 'Ana', mazo: { nombre: 'Atraxa', comandante: 'Atraxa' }, resultado: 'ganador', puntos: 3 },
    { id: 2, nombre_usuario: 'Beto', mazo: { nombre: 'Krenko' }, resultado: 'perdedor', puntos: 0 },
  ],
};

describe('PodTable', () => {
  it('no renderiza nada sin enfrentamiento', () => {
    const { container } = render(<PodTable enfrentamiento={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra el número de mesa y los jugadores', () => {
    render(<PodTable enfrentamiento={enfrentamiento} />);
    expect(screen.getByText('Mesa 3')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Beto')).toBeInTheDocument();
    expect(screen.getByText('Ganador')).toBeInTheDocument();
    expect(screen.getByText('Perdedor')).toBeInTheDocument();
  });

  it('muestra el botón de reportar cuando es editable y no finalizado', () => {
    render(<PodTable enfrentamiento={enfrentamiento} editable />);
    expect(screen.getByRole('button', { name: /reportar resultado/i })).toBeInTheDocument();
  });

  it('no muestra el botón si el enfrentamiento está finalizado', () => {
    render(<PodTable enfrentamiento={{ ...enfrentamiento, estado: 'finalizado' }} editable />);
    expect(screen.queryByRole('button', { name: /reportar resultado/i })).not.toBeInTheDocument();
  });

  it('usa el callback onReportarResultado al hacer click', async () => {
    const onReportarResultado = vi.fn();
    render(<PodTable enfrentamiento={enfrentamiento} editable onReportarResultado={onReportarResultado} />);
    await userEvent.click(screen.getByRole('button', { name: /reportar resultado/i }));
    expect(onReportarResultado).toHaveBeenCalled();
  });
});
