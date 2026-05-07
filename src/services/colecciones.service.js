import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export async function obtenerMiColeccion() {
  return apiGet('/colecciones/mia');
}

export async function agregarCartaAColeccion({ scryfall_id, cantidad, es_foil }) {
  return apiPost('/colecciones/cartas', { scryfall_id, cantidad, es_foil });
}

export async function actualizarCartaEnColeccion(cartaId, { cantidad, es_foil }) {
  return apiPatch(`/colecciones/cartas/${cartaId}`, { cantidad, es_foil });
}

export async function eliminarCartaDeColeccion(cartaId) {
  return apiDelete(`/colecciones/cartas/${cartaId}`);
}
