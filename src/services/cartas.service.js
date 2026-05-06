import { apiGet } from './api';

export async function buscarCartas(q, limit = 20) {
  const params = new URLSearchParams({ q, limit });
  return apiGet(`/cartas/buscar?${params}`);
}

export async function obtenerCarta(scryfallId) {
  return apiGet(`/cartas/${scryfallId}`);
}

export async function listarCartas(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiGet(`/cartas${qs ? `?${qs}` : ''}`);
}
