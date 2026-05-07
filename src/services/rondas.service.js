import { apiGet, apiPost } from './api';

export async function listarRondas(torneoId) {
  return apiGet(`/torneos/${torneoId}/rondas`);
}

export async function obtenerRonda(torneoId, rondaId) {
  return apiGet(`/torneos/${torneoId}/rondas/${rondaId}`);
}

export async function crearRonda(torneoId, { tipo }) {
  return apiPost(`/torneos/${torneoId}/rondas`, { tipo_ronda: tipo });
}
