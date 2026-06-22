import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const obtenerEstadisticasJugador = vi.fn();
const obtenerHistorialDiario = vi.fn();
vi.mock('@/services/usuarios.service', () => ({
  obtenerEstadisticasJugador: (...a) => obtenerEstadisticasJugador(...a),
  obtenerHistorialDiario: (...a) => obtenerHistorialDiario(...a),
}));

import EstadisticasJugador from '@/components/domain/EstadisticasJugador';

const stats = {
  partidasGanadas: 6,
  partidasPerdidas: 3,
  partidasEmpatadas: 1,
  winRate: 0.6,
  torneosParticipados: 2,
  torneosGanados: 1,
  historialUltimosMeses: [],
  mazoMasJugado: { nombre: 'Atraxa' },
};

describe('EstadisticasJugador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerHistorialDiario.mockResolvedValue([]);
  });

  it('muestra spinner mientras carga', () => {
    obtenerEstadisticasJugador.mockReturnValue(new Promise(() => {}));
    render(<EstadisticasJugador usuarioId={1} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra las tarjetas de estadísticas al cargar', async () => {
    obtenerEstadisticasJugador.mockResolvedValue(stats);
    render(<EstadisticasJugador usuarioId={1} />);
    await waitFor(() => expect(screen.getByText('Ganadas')).toBeInTheDocument());
    expect(screen.getByText('60.0%')).toBeInTheDocument();
    expect(screen.getByText('Atraxa')).toBeInTheDocument();
  });

  it('muestra un Alert ante error', async () => {
    obtenerEstadisticasJugador.mockRejectedValue(new Error('No se pudo cargar'));
    render(<EstadisticasJugador usuarioId={1} />);
    await waitFor(() => expect(screen.getByText('No se pudo cargar')).toBeInTheDocument());
  });

  it('en variante compacta no muestra el historial', async () => {
    obtenerEstadisticasJugador.mockResolvedValue(stats);
    render(<EstadisticasJugador usuarioId={1} variante="compacto" />);
    await waitFor(() => expect(screen.getByText('Ganadas')).toBeInTheDocument());
    expect(screen.queryByText('Historial últimos meses')).not.toBeInTheDocument();
  });

  it('al seleccionar un mes consulta el historial diario', async () => {
    obtenerEstadisticasJugador.mockResolvedValue({ ...stats, historialUltimosMeses: [{ mes_key: '2024-05', ganadas: 2, perdidas: 1 }] });
    obtenerHistorialDiario.mockResolvedValue([{ dia: '01', ganadas: 1, perdidas: 0 }]);
    render(<EstadisticasJugador usuarioId={1} />);
    await waitFor(() => expect(screen.getByText('Historial últimos meses')).toBeInTheDocument());
    await userEvent.selectOptions(screen.getByRole('combobox'), '2024-05');
    await waitFor(() => expect(obtenerHistorialDiario).toHaveBeenCalledWith(1, '2024-05'));
  });
});
