import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/services/supabase';
import { apiGet, apiPost } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchMe() {
    try {
      const data = await apiGet('/auth/me');
      setUser(data.user ?? data);
      setRol(data.rol ?? data.user?.rol ?? null);
      setPerfil(data.perfil ?? null);
    } catch (err) {
      setUser(null);
      setRol(null);
      setPerfil(null);
      setError(err.message);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await fetchMe();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchMe();
      } else {
        setUser(null);
        setRol(null);
        setPerfil(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;
    await fetchMe();
  }

  async function signup({ email, password, nombre_usuario, rol: rolElegido }) {
    setError(null);
    const data = await apiPost('/auth/signup', { email, password, nombre_usuario, rol: rolElegido });
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setRol(null);
    setPerfil(null);
  }

  return (
    <AuthContext.Provider value={{ user, rol, perfil, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
