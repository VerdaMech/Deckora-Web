import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiPatch: vi.fn(), apiPut: vi.fn(), apiDelete: vi.fn(), default: vi.fn() }));

import { apiGet } from '@/services/api';
import { buscarCartas, obtenerCarta, listarCartas } from '@/services/cartas.service';

describe('cartas.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('buscarCartas arma query con q y limit', async () => {
    apiGet.mockResolvedValue([]);
    await buscarCartas('sol ring', 10);
    const url = apiGet.mock.calls[0][0];
    expect(url).toContain('/cartas/buscar?');
    expect(url).toContain('q=sol+ring');
    expect(url).toContain('limit=10');
  });

  it('buscarCartas agrega formato cuando se pasa', async () => {
    apiGet.mockResolvedValue([]);
    await buscarCartas('jace', 20, 'COMMANDER');
    expect(apiGet.mock.calls[0][0]).toContain('formato=COMMANDER');
  });

  it('obtenerCarta hace GET /cartas/:scryfallId', async () => {
    apiGet.mockResolvedValue({ id: 'abc' });
    await obtenerCarta('abc');
    expect(apiGet).toHaveBeenCalledWith('/cartas/abc');
  });

  it('listarCartas sin params hace GET /cartas', async () => {
    apiGet.mockResolvedValue([]);
    await listarCartas();
    expect(apiGet).toHaveBeenCalledWith('/cartas');
  });

  it('listarCartas con params arma el query string', async () => {
    apiGet.mockResolvedValue([]);
    await listarCartas({ color: 'U' });
    expect(apiGet).toHaveBeenCalledWith('/cartas?color=U');
  });
});
