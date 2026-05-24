import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
    'Asegurate de tener un .env basado en .env.example.'
  );
}

// Custom storage adapter para Supabase.
// Persiste solo los campos mínimos necesarios para que la sesión funcione:
//   - Tokens y expiración: usados por Supabase para auth y auto-refresh.
//   - user.id + user.aud: requeridos por isSession()/isAuthUser() de Supabase
//     para validar la sesión almacenada. Sin ellos, Supabase la descarta y
//     llama _removeSession() concurrentemente con signOut(), causando el error
//     de lock "was released because another request stole it".
// El resto del objeto user (email, created_at, last_sign_in_at, identities, etc.)
// no es necesario: la app obtiene los datos del usuario vía /auth/me.
const SESSION_FIELDS = ['access_token', 'refresh_token', 'expires_at', 'expires_in', 'token_type'];

const minimalStorage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.access_token && parsed?.user) {
        const minimal = {
          ...Object.fromEntries(SESSION_FIELDS.filter((f) => f in parsed).map((f) => [f, parsed[f]])),
          user: { id: parsed.user.id, aud: parsed.user.aud },
        };
        localStorage.setItem(key, JSON.stringify(minimal));
        return;
      }
    } catch { /* no es JSON de sesión, guardar tal cual */ }
    localStorage.setItem(key, value);
  },
  removeItem: (key) => localStorage.removeItem(key),
};

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: minimalStorage,
  },
});
