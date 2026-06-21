import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiPatch: vi.fn(), apiPut: vi.fn(), apiDelete: vi.fn(), default: vi.fn() }));

import { apiGet } from '@/services/api';
import { listarCartas, listarSets } from '@/services/biblioteca.service';

describe('biblioteca.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('listarCartas usa page y limit por defecto', async () => {
    apiGet.mockResolvedValue([]);
    listarCartas();
    const url = apiGet.mock.calls[0][0];
    expect(url).toContain('page=1');
    expect(url).toContain('limit=40');
  });

  it('listarCartas agrega set_codigo cuando se pasa', async () => {
    apiGet.mockResolvedValue([]);
    listarCartas({ page: 2, limit: 10, set_codigo: 'mh3' });
    const url = apiGet.mock.calls[0][0];
    expect(url).toContain('set_codigo=mh3');
    expect(url).toContain('page=2');
  });

  it('listarSets hace GET /biblioteca/sets', () => {
    apiGet.mockResolvedValue([]);
    listarSets();
    expect(apiGet).toHaveBeenCalledWith('/biblioteca/sets');
  });
});
