import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
  default: vi.fn(),
}));

import { apiGet, apiPost, apiPatch, apiDelete } from '@/services/api';
import {
  listarMisMazos,
  listarMazosRecientes,
  crearMazo,
  obtenerMazo,
  agregarCartaAMazo,
  actualizarCartaEnMazo,
  eliminarCartaDeMazo,
  validarMazo,
  actualizarMazo,
  getRecomendaciones,
  importarMazo,
  autocompletarMazo,
  eliminarMazo,
} from '@/services/mazos.service';

describe('mazos.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('listarMisMazos hace GET /mazos', async () => {
    apiGet.mockResolvedValue([{ id: 1 }]);
    await expect(listarMisMazos()).resolves.toEqual([{ id: 1 }]);
    expect(apiGet).toHaveBeenCalledWith('/mazos');
  });

  it('listarMazosRecientes ordena por fecha y limita la cantidad', async () => {
    apiGet.mockResolvedValue([
      { id: 1, updated_at: '2024-01-01' },
      { id: 2, updated_at: '2024-03-01' },
      { id: 3, updated_at: '2024-02-01' },
    ]);
    const result = await listarMazosRecientes(2);
    expect(result.map((m) => m.id)).toEqual([2, 3]);
  });

  it('listarMazosRecientes soporta respuesta envuelta en { data }', async () => {
    apiGet.mockResolvedValue({ data: [{ id: 9, updated_at: '2024-01-01' }] });
    const result = await listarMazosRecientes();
    expect(result).toHaveLength(1);
  });

  it('crearMazo hace POST /mazos con los datos', async () => {
    apiPost.mockResolvedValue({ id: 5 });
    await crearMazo({ nombre: 'Atraxa', formato: 'COMMANDER', descripcion: 'x', publico: true });
    expect(apiPost).toHaveBeenCalledWith('/mazos', {
      nombre: 'Atraxa',
      formato: 'COMMANDER',
      descripcion: 'x',
      publico: true,
    });
  });

  it('obtenerMazo hace GET /mazos/:id', async () => {
    apiGet.mockResolvedValue({ id: 7 });
    await obtenerMazo(7);
    expect(apiGet).toHaveBeenCalledWith('/mazos/7');
  });

  it('agregarCartaAMazo mapea las claves a snake_case', async () => {
    apiPost.mockResolvedValue({});
    await agregarCartaAMazo(3, { scryfallId: 'abc', cantidad: 2, esComandante: true });
    expect(apiPost).toHaveBeenCalledWith('/mazos/3/cartas', {
      scryfall_id: 'abc',
      cantidad: 2,
      es_comandante: true,
    });
  });

  it('actualizarCartaEnMazo hace PATCH a la carta', async () => {
    apiPatch.mockResolvedValue({});
    await actualizarCartaEnMazo(3, 10, { cantidad: 4, esComandante: false });
    expect(apiPatch).toHaveBeenCalledWith('/mazos/3/cartas/10', {
      cantidad: 4,
      es_comandante: false,
    });
  });

  it('eliminarCartaDeMazo hace DELETE a la carta', async () => {
    apiDelete.mockResolvedValue(null);
    await eliminarCartaDeMazo(3, 10);
    expect(apiDelete).toHaveBeenCalledWith('/mazos/3/cartas/10');
  });

  it('validarMazo hace POST /validar', async () => {
    apiPost.mockResolvedValue({ valido: true });
    await validarMazo(3);
    expect(apiPost).toHaveBeenCalledWith('/mazos/3/validar', {});
  });

  it('actualizarMazo hace PATCH /mazos/:id', async () => {
    apiPatch.mockResolvedValue({});
    await actualizarMazo(3, { nombre: 'nuevo' });
    expect(apiPatch).toHaveBeenCalledWith('/mazos/3', { nombre: 'nuevo' });
  });

  it('getRecomendaciones hace GET /recomendaciones', async () => {
    apiGet.mockResolvedValue([]);
    await getRecomendaciones(3);
    expect(apiGet).toHaveBeenCalledWith('/mazos/3/recomendaciones');
  });

  it('importarMazo envía solo lista cuando no hay comandante', async () => {
    apiPost.mockResolvedValue({});
    await importarMazo(3, '4 Sol Ring');
    expect(apiPost).toHaveBeenCalledWith('/mazos/3/importar', { lista: '4 Sol Ring' });
  });

  it('importarMazo incluye comandante cuando se pasa', async () => {
    apiPost.mockResolvedValue({});
    await importarMazo(3, '4 Sol Ring', 'Atraxa');
    expect(apiPost).toHaveBeenCalledWith('/mazos/3/importar', { lista: '4 Sol Ring', comandante: 'Atraxa' });
  });

  it('autocompletarMazo hace POST /autocompletar', async () => {
    apiPost.mockResolvedValue({});
    await autocompletarMazo(3);
    expect(apiPost).toHaveBeenCalledWith('/mazos/3/autocompletar', {});
  });

  it('eliminarMazo hace DELETE /mazos/:id', async () => {
    apiDelete.mockResolvedValue(null);
    await eliminarMazo(3);
    expect(apiDelete).toHaveBeenCalledWith('/mazos/3');
  });
});
