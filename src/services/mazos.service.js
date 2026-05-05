import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export async function listarMisMazos() {
  return apiGet('/mazos');
}

export async function crearMazo({ nombre, formato, descripcion, publico }) {
  return apiPost('/mazos', { nombre, formato, descripcion, publico });
}

export async function obtenerMazo(id) {
  return apiGet(`/mazos/${id}`);
}

export async function agregarCartaAMazo(mazoId, { scryfallId, cantidad, esComandante }) {
  return apiPost(`/mazos/${mazoId}/cartas`, { scryfallId, cantidad, esComandante });
}

export async function actualizarCartaEnMazo(mazoId, cartaId, { cantidad, esComandante }) {
  return apiPatch(`/mazos/${mazoId}/cartas/${cartaId}`, { cantidad, esComandante });
}

export async function eliminarCartaDeMazo(mazoId, cartaId) {
  return apiDelete(`/mazos/${mazoId}/cartas/${cartaId}`);
}

export async function validarMazo(mazoId) {
  return apiPost(`/mazos/${mazoId}/validar`, {});
}
