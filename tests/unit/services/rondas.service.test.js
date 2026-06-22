import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiPatch: vi.fn(), apiPut: vi.fn(), apiDelete: vi.fn(), default: vi.fn() }));

import { apiGet, apiPost, apiDelete } from '@/services/api';
import { listarRondas, obtenerRonda, crearRonda, eliminarRonda } from '@/services/rondas.service';

describe('rondas.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('listarRondas hace GET /torneos/:id/rondas', async () => {
    apiGet.mockResolvedValue([]);
    await listarRondas(1);
    expect(apiGet).toHaveBeenCalledWith('/torneos/1/rondas');
  });

  it('obtenerRonda hace GET de la ronda', async () => {
    apiGet.mockResolvedValue({});
    await obtenerRonda(1, 2);
    expect(apiGet).toHaveBeenCalledWith('/torneos/1/rondas/2');
  });

  it('crearRonda mapea tipo a tipo_ronda', async () => {
    apiPost.mockResolvedValue({});
    await crearRonda(1, { tipo: 'swiss' });
    expect(apiPost).toHaveBeenCalledWith('/torneos/1/rondas', { tipo_ronda: 'swiss' });
  });

  it('eliminarRonda hace DELETE de la ronda', async () => {
    apiDelete.mockResolvedValue(null);
    await eliminarRonda(1, 2);
    expect(apiDelete).toHaveBeenCalledWith('/torneos/1/rondas/2');
  });
});
