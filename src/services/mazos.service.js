import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export async function listarMisMazos() {
  return apiGet('/mazos');
}

// El backend no soporta ?limit ni ?orden, se filtra client-side
export async function listarMazosRecientes(limit = 3) {
  const mazos = await apiGet('/mazos');
  const lista = Array.isArray(mazos) ? mazos : (mazos?.data ?? []);
  return lista
    .slice()
    .sort((a, b) => new Date(b.updated_at ?? b.createdAt ?? 0) - new Date(a.updated_at ?? a.createdAt ?? 0))
    .slice(0, limit);
}

export async function crearMazo({ nombre, formato, descripcion, publico }) {
  return apiPost('/mazos', { nombre, formato, descripcion, publico });
}

export async function obtenerMazo(id) {
  return apiGet(`/mazos/${id}`);
}

export async function agregarCartaAMazo(mazoId, { scryfallId, cantidad, esComandante }) {
  return apiPost(`/mazos/${mazoId}/cartas`, {
    scryfall_id: scryfallId,
    cantidad,
    es_comandante: esComandante,
  });
}

export async function actualizarCartaEnMazo(mazoId, cartaId, { cantidad, esComandante }) {
  return apiPatch(`/mazos/${mazoId}/cartas/${cartaId}`, {
    cantidad,
    es_comandante: esComandante,
  });
}

export async function eliminarCartaDeMazo(mazoId, cartaId) {
  return apiDelete(`/mazos/${mazoId}/cartas/${cartaId}`);
}

export async function validarMazo(mazoId) {
  return apiPost(`/mazos/${mazoId}/validar`, {});
}
