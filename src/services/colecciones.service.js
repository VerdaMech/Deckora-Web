import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export async function obtenerMiColeccion() {
  return apiGet('/colecciones/mia');
}

export async function agregarCartaAColeccion({ scryfallId, cantidad, foil }) {
  return apiPost('/colecciones/cartas', { scryfallId, cantidad, foil });
}

export async function actualizarCartaEnColeccion(cartaId, { cantidad, foil }) {
  return apiPatch(`/colecciones/cartas/${cartaId}`, { cantidad, foil });
}

export async function eliminarCartaDeColeccion(cartaId) {
  return apiDelete(`/colecciones/cartas/${cartaId}`);
}
