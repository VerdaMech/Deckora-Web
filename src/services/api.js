import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL ?? '';

async function limpiarSesionExpirada() {
  try {
    await supabase.auth.signOut();
  } catch {
    // best effort
  }
}

async function getAccessToken() {
  try {
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 3000));
    const session = supabase.auth.getSession().then(({ data }) => data?.session?.access_token ?? null);
    return await Promise.race([session, timeout]);
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const token = await getAccessToken();

  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  if (res.status === 401 && token) {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      limpiarSesionExpirada();
    }
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.message ?? body?.error ?? msg;
    } catch {
      try { msg = await res.text(); } catch { /* noop */ }
    }
    throw new Error(msg);
  }

  return res.json();
}

export const apiGet = (path) => apiFetch(path, { method: 'GET' });

export const apiPost = (path, body) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPatch = (path, body) =>
  apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });

export const apiPut = (path, body) =>
  apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });

export const apiDelete = (path) => apiFetch(path, { method: 'DELETE' });

export default apiFetch;
