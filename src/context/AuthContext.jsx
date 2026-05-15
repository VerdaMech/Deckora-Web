import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/services/supabase';
import * as authService from '@/services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe(token) {
    try {
      const data = await authService.getMe(token);
      setUser(data.user ?? data);
      setRol(data.rol ?? data.user?.rol ?? null);
      setPerfil(data.perfil ?? null);
    } catch {
      // No limpiar el estado aquí: errores de red temporales no deben cerrar la sesión.
      // Cuando la sesión expira de verdad, api.js llama signOut() → onAuthStateChange
      // dispara el else branch que limpia el estado correctamente.
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) await fetchMe(session.access_token);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchMe(session.access_token);
      } else {
        setUser(null);
        setRol(null);
        setPerfil(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const data = await authService.login(email, password);
    setUser(data.user ?? data);
    setRol(data.rol ?? data.user?.rol ?? null);
    setPerfil(data.perfil ?? null);
    return data;
  }

  async function signup(params) {
    const data = await authService.signup(params);
    setUser(data.user ?? data);
    setRol(data.rol ?? data.user?.rol ?? null);
    setPerfil(data.perfil ?? null);
    return data;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
    setRol(null);
    setPerfil(null);
  }

  return (
    <AuthContext.Provider value={{ user, rol, perfil, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
