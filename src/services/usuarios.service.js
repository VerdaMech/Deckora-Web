import { apiGet, apiPatch } from './api';

export async function obtenerPerfilPublico(username) {
  return apiGet(`/usuarios/${username}`);
}

export async function obtenerEstadisticas(usuarioId) {
  return apiGet(`/estadisticas/jugadores/${usuarioId}`);
}

export async function obtenerEstadisticasJugador(usuarioId) {
  const data = await apiGet(`/estadisticas/jugadores/${usuarioId}`);
  const ganadas = data.partidas_ganadas ?? 0;
  const perdidas = data.partidas_perdidas ?? 0;
  const empatadas = data.partidas_empatadas ?? 0;
  const total = data.total_partidas ?? ganadas + perdidas + empatadas;
  return {
    partidasGanadas: ganadas,
    partidasPerdidas: perdidas,
    partidasEmpatadas: empatadas,
    torneosParticipados: data.torneos_participados ?? 0,
    torneosGanados: data.torneos_ganados ?? 0,
    winRate: total > 0 ? ganadas / total : null,
    historialUltimosMeses: data.historialUltimosMeses ?? [],
    mazoMasJugado: data.mazoMasJugado ?? null,
    comandanteFavorito: data.comandanteFavorito ?? null,
  };
}

export async function obtenerHistorialDiario(usuarioId, mesKey) {
  return apiGet(`/estadisticas/jugadores/${usuarioId}/historial-diario?mes=${mesKey}`);
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
