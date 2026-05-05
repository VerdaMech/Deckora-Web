import { supabase } from './supabase';
import { apiGet, apiPost } from './api';

export async function signup({ email, password, nombre_usuario, rol }) {
  await apiPost('/auth/signup', { correo: email, password, nombre_usuario, rol });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return getMe();
}

export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return getMe();
}

export async function logout() {
  await supabase.auth.signOut();
  try {
    await apiPost('/auth/logout', {});
  } catch {
    // best effort — no falla si el backend no responde
  }
}

export async function getMe() {
  return apiGet('/auth/me');
}

export async function recuperarPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/recuperar',
  });
  if (error) throw error;
}
