import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
    'Asegurate de tener un .env basado en .env.example.'
  );
}

// Solo persiste los campos necesarios para el refresh de tokens.
// Elimina datos sensibles del usuario (email, created_at, last_sign_in_at, etc.)
// que Supabase almacenaría en el objeto `user` del localStorage.
const TOKEN_FIELDS = ['access_token', 'refresh_token', 'expires_at', 'expires_in', 'token_type'];

const minimalStorage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.access_token) {
        const slim = Object.fromEntries(
          TOKEN_FIELDS.filter((f) => f in parsed).map((f) => [f, parsed[f]])
        );
        localStorage.setItem(key, JSON.stringify(slim));
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
