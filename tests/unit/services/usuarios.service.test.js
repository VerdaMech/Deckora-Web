import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiPatch: vi.fn(), apiPut: vi.fn(), apiDelete: vi.fn(), default: vi.fn() }));

import { apiGet, apiPatch } from '@/services/api';
import {
  obtenerPerfilPublico,
  obtenerEstadisticas,
  obtenerEstadisticasJugador,
  obtenerHistorialDiario,
  obtenerMisInscripciones,
  obtenerTorneosDeUsuario,
  actualizarMiPerfil,
} from '@/services/usuarios.service';

describe('usuarios.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('obtenerPerfilPublico hace GET /usuarios/:username', async () => {
    apiGet.mockResolvedValue({});
    await obtenerPerfilPublico('vato');
    expect(apiGet).toHaveBeenCalledWith('/usuarios/vato');
  });

  it('obtenerEstadisticas hace GET /estadisticas/jugadores/:id', async () => {
    apiGet.mockResolvedValue({});
    await obtenerEstadisticas(1);
    expect(apiGet).toHaveBeenCalledWith('/estadisticas/jugadores/1');
  });

  it('obtenerEstadisticasJugador mapea y calcula winRate', async () => {
    apiGet.mockResolvedValue({
      partidas_ganadas: 6,
      partidas_perdidas: 3,
      partidas_empatadas: 1,
      torneos_participados: 2,
      torneos_ganados: 1,
    });
    const stats = await obtenerEstadisticasJugador(1);
    expect(stats.partidasGanadas).toBe(6);
    expect(stats.winRate).toBe(0.6);
    expect(stats.torneosParticipados).toBe(2);
  });

  it('obtenerEstadisticasJugador devuelve winRate null sin partidas', async () => {
    apiGet.mockResolvedValue({});
    const stats = await obtenerEstadisticasJugador(1);
    expect(stats.winRate).toBeNull();
    expect(stats.historialUltimosMeses).toEqual([]);
  });

  it('obtenerHistorialDiario incluye el mes en el query', async () => {
    apiGet.mockResolvedValue([]);
    await obtenerHistorialDiario(1, '2024-05');
    expect(apiGet).toHaveBeenCalledWith('/estadisticas/jugadores/1/historial-diario?mes=2024-05');
  });

  it('obtenerMisInscripciones hace GET /torneos?inscrito=me', async () => {
    apiGet.mockResolvedValue([]);
    await obtenerMisInscripciones();
    expect(apiGet).toHaveBeenCalledWith('/torneos?inscrito=me');
  });

  it('obtenerTorneosDeUsuario hace GET /tiendas/:id/torneos', async () => {
    apiGet.mockResolvedValue([]);
    await obtenerTorneosDeUsuario(3);
    expect(apiGet).toHaveBeenCalledWith('/tiendas/3/torneos');
  });

  it('actualizarMiPerfil hace PATCH /usuarios/me', async () => {
    apiPatch.mockResolvedValue({ ok: true });
    await expect(actualizarMiPerfil({ bio: 'x' })).resolves.toEqual({ ok: true });
    expect(apiPatch).toHaveBeenCalledWith('/usuarios/me', { bio: 'x' });
  });

  it('actualizarMiPerfil devuelve los datos enviados ante error', async () => {
    apiPatch.mockRejectedValue(new Error('falló'));
    await expect(actualizarMiPerfil({ bio: 'x' })).resolves.toEqual({ bio: 'x' });
  });
});
