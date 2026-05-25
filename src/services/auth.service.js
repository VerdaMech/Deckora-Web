import { supabase } from './supabase';
import apiFetch, { apiGet, apiPost } from './api';

export async function signup({ email, password, nombre_usuario, rol, nombre_tienda }) {
  await apiPost('/auth/signup', { correo: email, password, nombre_usuario, rol, nombre_tienda });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message?.includes('Email not confirmed')) {
      return { requiresEmailVerification: true };
    }
    throw error;
  }
  // Usar el token devuelto directamente para evitar llamar a getSession() mientras
  // Supabase mantiene su lock interno después de signInWithPassword.
  return apiFetch('/auth/me', { method: 'GET', headers: { 'Authorization': `Bearer ${data.session.access_token}` } });
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // Usar el token devuelto directamente para evitar llamar a getSession() mientras
  // Supabase mantiene su lock interno después de signInWithPassword.
  return apiFetch('/auth/me', { method: 'GET', headers: { 'Authorization': `Bearer ${data.session.access_token}` } });
}

export async function logout() {
  await supabase.auth.signOut();
  try {
    await apiPost('/auth/logout', {});
  } catch {
    // best effort — no falla si el backend no responde
  }
}

export async function getMe(token) {
  if (token) {
    return apiFetch('/auth/me', { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
  }
  return apiGet('/auth/me');
}

export async function recuperarPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/recuperar',
  });
  if (error) throw error;
}
