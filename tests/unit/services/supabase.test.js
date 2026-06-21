import { describe, it, expect, vi, beforeEach } from 'vitest';

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn(() => ({ mock: 'client' })) }));
vi.mock('@supabase/supabase-js', () => ({ createClient }));

import { supabase } from '@/services/supabase';

// Recupera el storage adapter pasado a createClient para probar su lógica.
const storage = createClient.mock.calls[0][2].auth.storage;

describe('supabase (config + minimalStorage)', () => {
  beforeEach(() => localStorage.clear());

  it('crea el cliente con la url y la anon key del entorno', () => {
    expect(createClient).toHaveBeenCalledWith(
      'http://localhost:54321',
      'test-anon-key',
      expect.objectContaining({ auth: expect.objectContaining({ persistSession: true }) }),
    );
    expect(supabase).toEqual({ mock: 'client' });
  });

  it('setItem guarda solo los campos mínimos de la sesión', () => {
    const full = JSON.stringify({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 123,
      token_type: 'bearer',
      user: { id: 'u1', aud: 'authenticated', email: 'secreto@a.cl', identities: [{}] },
    });
    storage.setItem('sb-session', full);
    const guardado = JSON.parse(localStorage.getItem('sb-session'));
    expect(guardado.access_token).toBe('a');
    expect(guardado.refresh_token).toBe('r');
    expect(guardado.user).toEqual({ id: 'u1', aud: 'authenticated' });
    expect(guardado.user.email).toBeUndefined();
  });

  it('setItem guarda tal cual un valor que no es sesión', () => {
    storage.setItem('clave', JSON.stringify({ foo: 'bar' }));
    expect(JSON.parse(localStorage.getItem('clave'))).toEqual({ foo: 'bar' });
  });

  it('setItem guarda tal cual un valor que no es JSON', () => {
    storage.setItem('clave', 'texto-plano');
    expect(localStorage.getItem('clave')).toBe('texto-plano');
  });

  it('getItem y removeItem delegan en localStorage', () => {
    localStorage.setItem('k', 'v');
    expect(storage.getItem('k')).toBe('v');
    storage.removeItem('k');
    expect(localStorage.getItem('k')).toBeNull();
  });
});
