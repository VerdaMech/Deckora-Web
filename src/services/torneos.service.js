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
    console.info('[actualizarTorneo] Endpoint no disponible, simulando respuesta');
    return Promise.resolve({ ...datos, id });
  }
}

export async function cambiarEstadoTorneo(id, nuevoEstado) {
  try {
    return await apiPatch(`/torneos/${id}/estado`, { estado: nuevoEstado });
  } catch {
    // TODO: reemplazar por endpoint real cuando exista
    console.info('[cambiarEstadoTorneo] Endpoint no disponible, simulando respuesta');
    return Promise.resolve({ id, estado: nuevoEstado });
  }
}

export async function cancelarInscripcion(torneoId, inscripcionId) {
  // TODO: reemplazar por endpoint real cuando exista
  try {
    return await apiDelete(`/torneos/${torneoId}/inscripciones/${inscripcionId}`);
  } catch {
    return Promise.resolve(null);
  }
}
