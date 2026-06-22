import { describe, it, expect, vi, beforeEach } from 'vitest';

const signInWithPassword = vi.fn();
const signOut = vi.fn();
const resetPasswordForEmail = vi.fn();

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...a) => signInWithPassword(...a),
      signOut: (...a) => signOut(...a),
      resetPasswordForEmail: (...a) => resetPasswordForEmail(...a),
    },
  },
}));

const apiFetch = vi.fn();
const apiGet = vi.fn();
const apiPost = vi.fn();
vi.mock('@/services/api', () => ({
  default: (...a) => apiFetch(...a),
  apiGet: (...a) => apiGet(...a),
  apiPost: (...a) => apiPost(...a),
}));

import { signup, login, logout, getMe, recuperarPassword } from '@/services/auth.service';

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInWithPassword.mockResolvedValue({ data: { session: { access_token: 'tok' } }, error: null });
    signOut.mockResolvedValue({});
    resetPasswordForEmail.mockResolvedValue({ error: null });
    apiPost.mockResolvedValue({});
    apiFetch.mockResolvedValue({ id: 1, correo: 'a@a.cl' });
  });

  it('signup registra, inicia sesión y devuelve el usuario de /auth/me', async () => {
    const result = await signup({ email: 'a@a.cl', password: '123', nombre_usuario: 'a', rol: 'jugador' });
    expect(apiPost).toHaveBeenCalledWith('/auth/signup', expect.objectContaining({ correo: 'a@a.cl', rol: 'jugador' }));
    expect(apiFetch).toHaveBeenCalledWith('/auth/me', expect.objectContaining({
      headers: { Authorization: 'Bearer tok' },
    }));
    expect(result).toEqual({ id: 1, correo: 'a@a.cl' });
  });

  it('signup devuelve requiresEmailVerification si el correo no está confirmado', async () => {
    signInWithPassword.mockResolvedValue({ data: null, error: { message: 'Email not confirmed' } });
    const result = await signup({ email: 'a@a.cl', password: '123', nombre_usuario: 'a', rol: 'jugador' });
    expect(result).toEqual({ requiresEmailVerification: true });
  });

  it('signup propaga otros errores de login', async () => {
    signInWithPassword.mockResolvedValue({ data: null, error: { message: 'otra cosa' } });
    await expect(signup({ email: 'a@a.cl', password: '123', nombre_usuario: 'a', rol: 'jugador' })).rejects.toMatchObject({ message: 'otra cosa' });
  });

  it('login devuelve el usuario al autenticar correctamente', async () => {
    const result = await login('a@a.cl', '123');
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'a@a.cl', password: '123' });
    expect(result).toEqual({ id: 1, correo: 'a@a.cl' });
  });

  it('login lanza el error de Supabase', async () => {
    signInWithPassword.mockResolvedValue({ data: null, error: new Error('Invalid login credentials') });
    await expect(login('a@a.cl', 'mal')).rejects.toThrow('Invalid login credentials');
  });

  it('logout cierra sesión y no falla si el backend no responde', async () => {
    apiPost.mockRejectedValue(new Error('down'));
    await expect(logout()).resolves.toBeUndefined();
    expect(signOut).toHaveBeenCalled();
  });

  it('getMe con token usa Authorization', async () => {
    await getMe('mi-token');
    expect(apiFetch).toHaveBeenCalledWith('/auth/me', expect.objectContaining({
      headers: { Authorization: 'Bearer mi-token' },
    }));
  });

  it('getMe sin token hace GET /auth/me', async () => {
    apiGet.mockResolvedValue({ id: 2 });
    await getMe();
    expect(apiGet).toHaveBeenCalledWith('/auth/me');
  });

  it('recuperarPassword llama a resetPasswordForEmail con redirect a /recuperar', async () => {
    await recuperarPassword('a@a.cl');
    expect(resetPasswordForEmail).toHaveBeenCalledWith('a@a.cl', expect.objectContaining({
      redirectTo: expect.stringContaining('/recuperar'),
    }));
  });

  it('recuperarPassword lanza si Supabase devuelve error', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: new Error('no existe') });
    await expect(recuperarPassword('a@a.cl')).rejects.toThrow('no existe');
  });
});
