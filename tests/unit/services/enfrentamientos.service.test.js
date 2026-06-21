import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiPatch: vi.fn(), apiPut: vi.fn(), apiDelete: vi.fn(), default: vi.fn() }));

import { apiGet, apiPatch } from '@/services/api';
import { obtenerEnfrentamiento, actualizarResultado, actualizarEstado } from '@/services/enfrentamientos.service';

describe('enfrentamientos.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('obtenerEnfrentamiento hace GET /enfrentamientos/:id', async () => {
    apiGet.mockResolvedValue({});
    await obtenerEnfrentamiento(1);
    expect(apiGet).toHaveBeenCalledWith('/enfrentamientos/1');
  });

  it('actualizarResultado hace PATCH /resultado', async () => {
    apiPatch.mockResolvedValue({});
    await actualizarResultado(1, { ganador_id: 5 });
    expect(apiPatch).toHaveBeenCalledWith('/enfrentamientos/1/resultado', { ganador_id: 5 });
  });

  it('actualizarEstado hace PATCH /estado', async () => {
    apiPatch.mockResolvedValue({});
    await actualizarEstado(1, { estado: 'finalizado' });
    expect(apiPatch).toHaveBeenCalledWith('/enfrentamientos/1/estado', { estado: 'finalizado' });
  });
});
