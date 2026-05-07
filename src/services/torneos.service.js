import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './api';

export async function listarTorneos(params = {}) {
  const query = new URLSearchParams();
  if (params.formato) query.set('formato', params.formato);
  if (params.estado) query.set('estado', params.estado);
  if (params.desde) query.set('desde', params.desde);
  if (params.hasta) query.set('hasta', params.hasta);
  if (params.q) query.set('q', params.q);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  if (params.organizador_id) query.set('organizador_id', params.organizador_id);

  const qs = query.toString();
  const data = await apiGet(`/torneos${qs ? `?${qs}` : ''}`);
  return data;
}

export async function obtenerTorneo(id) {
  return apiGet(`/torneos/${id}`);
}

export async function crearTorneo(datos) {
  return apiPost('/torneos', datos);
}

export async function inscribirseATorneo(torneoId, { mazoId }) {
  return apiPost(`/torneos/${torneoId}/inscripciones`, { mazo_id: mazoId });
}

export async function listarInscripciones(torneoId) {
  return apiGet(`/torneos/${torneoId}/inscripciones`);
}

export async function actualizarTorneo(id, datos) {
  try {
    return await apiPut(`/torneos/${id}`, datos);
  } catch {
    // TODO: reemplazar por endpoint real cuando exista
    return Promise.resolve({ ...datos, id });
  }
}

export async function cambiarEstadoTorneo(id, nuevoEstado) {
  return apiPatch(`/torneos/${id}/estado`, { estado: nuevoEstado });
}

export async function cancelarInscripcion(torneoId, inscripcionId) {
  // TODO: reemplazar por endpoint real cuando exista
  try {
    return await apiDelete(`/torneos/${torneoId}/inscripciones/${inscripcionId}`);
  } catch {
    return Promise.resolve(null);
  }
}

export async function listarTorneosProximos(limit = 5) {
  const hoy = new Date().toISOString();
  const query = new URLSearchParams({ desde: hoy, limit: String(limit) });
  try {
    const data = await apiGet(`/torneos?${query.toString()}`);
    return { data: Array.isArray(data) ? data : (data?.data ?? []) };
  } catch {
    return { data: [] };
  }
}

export async function listarMisTorneos(organizadorId) {
  if (!organizadorId) return { data: [] };
  try {
    const data = await apiGet(`/torneos?organizador_id=${organizadorId}`);
    return { data: Array.isArray(data) ? data : (data?.data ?? []) };
  } catch {
    return { data: [] };
  }
}

export async function listarTorneosDelJugador(limit = 5) {
  try {
    const data = await apiGet(`/jugadores/me/torneos?limit=${limit}`);
    return { data: Array.isArray(data) ? data : (data?.data ?? []) };
  } catch {
    return { data: [] };
  }
}

export async function listarMisInscripciones() {
  try {
    const data = await apiGet('/jugadores/me/inscripciones');
    return Array.isArray(data) ? data : (data?.data ?? []);
  } catch {
    return [];
  }
}
