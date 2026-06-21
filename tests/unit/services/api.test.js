import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del cliente de Supabase usado por api.js para controlar tokens/refresh.
const getSession = vi.fn();
const refreshSession = vi.fn();
const signOut = vi.fn();

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...a) => getSession(...a),
      refreshSession: (...a) => refreshSession(...a),
      signOut: (...a) => signOut(...a),
    },
  },
}));

import apiFetch, { apiGet, apiPost, apiPatch, apiPut, apiDelete } from '@/services/api';

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, json: vi.fn().mockResolvedValue(body), text: vi.fn().mockResolvedValue('') };
}

describe('api (apiFetch)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue({ data: { session: { access_token: 'tok-123' } } });
    refreshSession.mockResolvedValue({ data: { session: { access_token: 'tok-new' } }, error: null });
    signOut.mockResolvedValue({});
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
  });

  it('hace GET y devuelve el JSON', async () => {
    global.fetch.mockResolvedValue(jsonResponse([{ id: 1 }]));
    const result = await apiGet('/mazos');
    expect(global.fetch).toHaveBeenCalledWith('/mazos', expect.objectContaining({ method: 'GET' }));
    expect(result).toEqual([{ id: 1 }]);
  });

  it('agrega el header Authorization cuando hay token', async () => {
    await apiGet('/mazos');
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer tok-123');
  });

  it('no agrega Authorization cuando no hay sesión', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await apiGet('/cartas');
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('agrega Content-Type application/json cuando hay body', async () => {
    await apiPost('/mazos', { nombre: 'x' });
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('/mazos');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.body).toBe(JSON.stringify({ nombre: 'x' }));
  });

  it('devuelve null ante un 204 No Content', async () => {
    global.fetch.mockResolvedValue({ status: 204, ok: true });
    const result = await apiDelete('/mazos/1');
    expect(result).toBeNull();
  });

  it('si getSession falla, sigue sin token', async () => {
    getSession.mockRejectedValue(new Error('lock'));
    await apiGet('/cartas');
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('ante 401 refresca el token y reintenta con el nuevo token', async () => {
    global.fetch
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    const result = await apiGet('/mazos');
    expect(refreshSession).toHaveBeenCalled();
    const [, retryOptions] = global.fetch.mock.calls[1];
    expect(retryOptions.headers.Authorization).toBe('Bearer tok-new');
    expect(result).toEqual({ ok: true });
  });

  it('ante 401 con refresh fallido cierra sesión y lanza "Sesión expirada"', async () => {
    global.fetch.mockResolvedValue({ status: 401, ok: false });
    refreshSession.mockResolvedValue({ data: null, error: new Error('no refresh') });
    await expect(apiGet('/mazos')).rejects.toThrow('Sesión expirada');
    expect(signOut).toHaveBeenCalled();
  });

  it('ante 401 si el reintento vuelve 401 lanza "Sesión expirada"', async () => {
    global.fetch
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({ status: 401, ok: false });
    await expect(apiGet('/mazos')).rejects.toThrow('Sesión expirada');
    expect(signOut).toHaveBeenCalled();
  });

  it('ante 204 en el reintento devuelve null', async () => {
    global.fetch
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({ status: 204, ok: true });
    const result = await apiGet('/mazos');
    expect(result).toBeNull();
  });

  it('lanza el mensaje del body cuando la respuesta no es ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: 'Datos inválidos' }),
      text: vi.fn(),
    });
    await expect(apiGet('/mazos')).rejects.toThrow('Datos inválidos');
  });

  it('usa el texto cuando el body de error no es JSON', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('no json')),
      text: vi.fn().mockResolvedValue('Error interno'),
    });
    await expect(apiGet('/mazos')).rejects.toThrow('Error interno');
  });

  it('lanza el mensaje del body en el reintento fallido (no-ok)', async () => {
    global.fetch
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: 'Sigue mal' }),
        text: vi.fn(),
      });
    await expect(apiGet('/mazos')).rejects.toThrow('Sigue mal');
  });

  it('apiPatch, apiPut y apiDelete usan el método correcto', async () => {
    await apiPatch('/a', { x: 1 });
    await apiPut('/b', { y: 2 });
    await apiDelete('/c');
    expect(global.fetch.mock.calls[0][1].method).toBe('PATCH');
    expect(global.fetch.mock.calls[1][1].method).toBe('PUT');
    expect(global.fetch.mock.calls[2][1].method).toBe('DELETE');
  });

  it('apiFetch por defecto hace GET implícito sin opciones', async () => {
    global.fetch.mockResolvedValue(jsonResponse({ ok: 1 }));
    await apiFetch('/ping');
    expect(global.fetch).toHaveBeenCalledWith('/ping', expect.any(Object));
  });
});
