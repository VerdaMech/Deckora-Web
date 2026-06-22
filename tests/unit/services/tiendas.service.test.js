import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiPatch: vi.fn(), apiPut: vi.fn(), apiDelete: vi.fn(), default: vi.fn() }));

import { apiGet, apiPut } from '@/services/api';
import {
  listarTiendas,
  listarTiendasCercanas,
  obtenerTienda,
  listarTorneosDeTienda,
  actualizarMiTienda,
} from '@/services/tiendas.service';

describe('tiendas.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('listarTiendas devuelve { data, error: null } en éxito', async () => {
    apiGet.mockResolvedValue([{ id: 1 }]);
    await expect(listarTiendas()).resolves.toEqual({ data: [{ id: 1 }], error: null });
  });

  it('listarTiendas captura el error y devuelve el mensaje', async () => {
    apiGet.mockRejectedValue(new Error('sin red'));
    await expect(listarTiendas()).resolves.toEqual({ data: null, error: 'sin red' });
  });

  it('listarTiendasCercanas arma el query con lat/lng/radio', async () => {
    apiGet.mockResolvedValue([]);
    await listarTiendasCercanas({ lat: -33, lng: -70, radio: 5 });
    expect(apiGet).toHaveBeenCalledWith('/tiendas/cercanas?lat=-33&lng=-70&radio=5');
  });

  it('obtenerTienda devuelve data en éxito y error ante fallo', async () => {
    apiGet.mockResolvedValue({ id: 2 });
    await expect(obtenerTienda(2)).resolves.toEqual({ data: { id: 2 }, error: null });
    apiGet.mockRejectedValue(new Error('404'));
    await expect(obtenerTienda(2)).resolves.toEqual({ data: null, error: '404' });
  });

  it('listarTorneosDeTienda hace GET /tiendas/:id/torneos', async () => {
    apiGet.mockResolvedValue([]);
    await listarTorneosDeTienda(2);
    expect(apiGet).toHaveBeenCalledWith('/tiendas/2/torneos');
  });

  it('actualizarMiTienda hace PUT y devuelve datos ante error', async () => {
    apiPut.mockResolvedValue({ ok: true });
    await expect(actualizarMiTienda(2, { nombre: 'X' })).resolves.toEqual({ ok: true });
    apiPut.mockRejectedValue(new Error('falló'));
    await expect(actualizarMiTienda(2, { nombre: 'X' })).resolves.toEqual({ nombre: 'X' });
  });
});
