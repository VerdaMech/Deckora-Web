import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export async function listarTorneos() {
  try {
    const data = await apiGet('/torneos');
    return { data: Array.isArray(data) ? data : (data?.data ?? []), error: null };
  } catch (e) {
    return { data: [], error: e.message };
  }
}

// El backend no tiene filtros por proximidad; se filtra client-side por fecha futura y estado pendiente
export async function listarTorneosProximos(limit = 3) {
  const { data, error } = await listarTorneos();
  if (error) return { data: [], error };
  const ahora = new Date();
  const proximos = data
    .filter((t) => {
      const fecha = t.fecha ?? t.fecha_inicio;
      return fecha && new Date(fecha) > ahora && (t.estado === 'pendiente' || t.estado === 'activo' || !t.estado);
    })
    .sort((a, b) => new Date(a.fecha ?? a.fecha_inicio) - new Date(b.fecha ?? b.fecha_inicio))
    .slice(0, limit);
  return { data: proximos, error: null };
}

export async function listarMisTorneos(organizadorId) {
  const { data, error } = await listarTorneos();
  if (error) return { data: [], error };
  const mios = data.filter((t) => t.organizador_id === organizadorId || t.organizadorId === organizadorId);
  return { data: mios, error: null };
}

export async function obtenerTorneo(id) {
  try {
    const data = await apiGet(`/torneos/${id}`);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

export async function crearTorneo(payload) {
  return apiPost('/torneos', payload);
}

export async function actualizarTorneo(id, payload) {
  return apiPatch(`/torneos/${id}`, payload);
}

export async function eliminarTorneo(id) {
  return apiDelete(`/torneos/${id}`);
}

export async function inscribirseEnTorneo(torneoId) {
  return apiPost(`/torneos/${torneoId}/inscripciones`, {});
}
