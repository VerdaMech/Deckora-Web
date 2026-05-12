import { apiGet, apiPatch } from './api';

export async function obtenerPerfilPublico(username) {
  return apiGet(`/usuarios/${username}`);
}

export async function obtenerEstadisticas(usuarioId) {
  return apiGet(`/estadisticas/jugadores/${usuarioId}`);
}

export async function obtenerEstadisticasJugador(usuarioId) {
  return apiGet(`/estadisticas/jugadores/${usuarioId}`);
}

export async function obtenerMisInscripciones() {
  return apiGet('/torneos?inscrito=me');
}

export async function obtenerTorneosDeUsuario(usuarioId) {
  return apiGet(`/tiendas/${usuarioId}/torneos`);
}

export async function actualizarMiPerfil(data) {
  try {
    return await apiPatch('/usuarios/me', data);
  } catch {
    return data;
  }
}
