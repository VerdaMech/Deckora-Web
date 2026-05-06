import { apiGet, apiPatch } from './api';

export async function obtenerEnfrentamiento(id) {
  return apiGet(`/enfrentamientos/${id}`);
}

export async function actualizarResultado(id, datos) {
  return apiPatch(`/enfrentamientos/${id}/resultado`, datos);
}

export async function actualizarEstado(id, { estado }) {
  return apiPatch(`/enfrentamientos/${id}/estado`, { estado });
}
