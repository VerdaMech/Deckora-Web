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
  listarTorneos,
  obtenerTorneo,
  crearTorneo,
  inscribirseATorneo,
  listarInscripciones,
  actualizarTorneo,
  cambiarEstadoTorneo,
  cancelarInscripcion,
  listarTorneosProximos,
  listarMisTorneos,
  listarTorneosDelJugador,
  listarMisInscripciones,
  listarPendientes,
  aprobarInscripcion,
  rechazarInscripcion,
  eliminarJugadorDeTorneo,
  obtenerSnapshotInscripcion,
} from '@/services/torneos.service';

describe('torneos.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('listarTorneos sin filtros hace GET /torneos', async () => {
    apiGet.mockResolvedValue([]);
    await listarTorneos();
    expect(apiGet).toHaveBeenCalledWith('/torneos');
  });

  it('listarTorneos arma el query string con los filtros', async () => {
    apiGet.mockResolvedValue([]);
    await listarTorneos({ formato: 'COMMANDER', estado: 'pendiente', q: 'liga' });
    const url = apiGet.mock.calls[0][0];
    expect(url).toContain('formato=COMMANDER');
    expect(url).toContain('estado=pendiente');
    expect(url).toContain('q=liga');
  });

  it('obtenerTorneo hace GET /torneos/:id', async () => {
    apiGet.mockResolvedValue({ id: 1 });
    await obtenerTorneo(1);
    expect(apiGet).toHaveBeenCalledWith('/torneos/1');
  });

  it('crearTorneo hace POST /torneos', async () => {
    apiPost.mockResolvedValue({ id: 2 });
    await crearTorneo({ nombre: 'X' });
    expect(apiPost).toHaveBeenCalledWith('/torneos', { nombre: 'X' });
  });

  it('inscribirseATorneo mapea mazoId a mazo_id', async () => {
    apiPost.mockResolvedValue({});
    await inscribirseATorneo(5, { mazoId: 99 });
    expect(apiPost).toHaveBeenCalledWith('/torneos/5/inscripciones', { mazo_id: 99 });
  });

  it('listarInscripciones hace GET /inscripciones', async () => {
    apiGet.mockResolvedValue([]);
    await listarInscripciones(5);
    expect(apiGet).toHaveBeenCalledWith('/torneos/5/inscripciones');
  });

  it('actualizarTorneo hace PATCH /torneos/:id', async () => {
    apiPatch.mockResolvedValue({});
    await actualizarTorneo(5, { nombre: 'Y' });
    expect(apiPatch).toHaveBeenCalledWith('/torneos/5', { nombre: 'Y' });
  });

  it('cambiarEstadoTorneo hace PATCH /estado', async () => {
    apiPatch.mockResolvedValue({});
    await cambiarEstadoTorneo(5, 'en_curso');
    expect(apiPatch).toHaveBeenCalledWith('/torneos/5/estado', { estado: 'en_curso' });
  });

  it('cancelarInscripcion hace DELETE', async () => {
    apiDelete.mockResolvedValue(null);
    await cancelarInscripcion(5, 7);
    expect(apiDelete).toHaveBeenCalledWith('/torneos/5/inscripciones/7');
  });

  it('listarTorneosProximos normaliza array y captura errores', async () => {
    apiGet.mockResolvedValue([{ id: 1 }]);
    await expect(listarTorneosProximos()).resolves.toEqual({ data: [{ id: 1 }] });
    apiGet.mockRejectedValue(new Error('boom'));
    await expect(listarTorneosProximos()).resolves.toEqual({ data: [] });
  });

  it('listarMisTorneos devuelve [] sin organizadorId', async () => {
    await expect(listarMisTorneos()).resolves.toEqual({ data: [] });
    expect(apiGet).not.toHaveBeenCalled();
  });

  it('listarMisTorneos usa data envuelta y captura errores', async () => {
    apiGet.mockResolvedValue({ data: [{ id: 3 }] });
    await expect(listarMisTorneos(10)).resolves.toEqual({ data: [{ id: 3 }] });
    apiGet.mockRejectedValue(new Error('x'));
    await expect(listarMisTorneos(10)).resolves.toEqual({ data: [] });
  });

  it('listarTorneosDelJugador captura errores', async () => {
    apiGet.mockResolvedValue([{ id: 1 }]);
    await expect(listarTorneosDelJugador()).resolves.toEqual({ data: [{ id: 1 }] });
    apiGet.mockRejectedValue(new Error('x'));
    await expect(listarTorneosDelJugador()).resolves.toEqual({ data: [] });
  });

  it('listarMisInscripciones devuelve array y [] ante error', async () => {
    apiGet.mockResolvedValue([{ id: 1 }]);
    await expect(listarMisInscripciones()).resolves.toEqual([{ id: 1 }]);
    apiGet.mockRejectedValue(new Error('x'));
    await expect(listarMisInscripciones()).resolves.toEqual([]);
  });

  it('listarPendientes, aprobar, rechazar y eliminar apuntan a las rutas correctas', async () => {
    apiGet.mockResolvedValue([]);
    apiPatch.mockResolvedValue({});
    apiDelete.mockResolvedValue(null);
    await listarPendientes(1);
    await aprobarInscripcion(1, 2);
    await rechazarInscripcion(1, 2);
    await eliminarJugadorDeTorneo(1, 2);
    expect(apiGet).toHaveBeenCalledWith('/torneos/1/inscripciones/pendientes');
    expect(apiPatch).toHaveBeenCalledWith('/torneos/1/inscripciones/2/aprobar', {});
    expect(apiDelete).toHaveBeenNthCalledWith(1, '/torneos/1/inscripciones/2/rechazar');
    expect(apiDelete).toHaveBeenNthCalledWith(2, '/torneos/1/inscripciones/2');
  });

  it('obtenerSnapshotInscripcion hace GET /snapshot', async () => {
    apiGet.mockResolvedValue({});
    await obtenerSnapshotInscripcion(1, 2);
    expect(apiGet).toHaveBeenCalledWith('/torneos/1/inscripciones/2/snapshot');
  });
});
