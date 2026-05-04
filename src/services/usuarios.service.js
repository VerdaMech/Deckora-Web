import { apiGet, apiPatch } from './api';

// TODO: integrar endpoint real cuando exista
export async function obtenerPerfilPublico(username) {
  try {
    return await apiGet(`/usuarios/${username}`);
  } catch {
    const roles = ['jugador', 'organizador', 'tienda'];
    const rol = roles[username.length % 3];
    return {
      id: `mock-${username}`,
      nombre_usuario: username,
      rol,
      descripcion: rol === 'organizador' ? 'Organizador apasionado de torneos Commander.' : null,
      sitio_web: rol === 'organizador' ? 'https://ejemplo.com' : null,
      nombre_tienda: rol === 'tienda' ? `Tienda ${username}` : null,
      direccion: rol === 'tienda' ? 'Av. Las Condes 1234, Santiago' : null,
      numero_telefono: rol === 'tienda' ? '+56 9 1234 5678' : null,
      horario_apertura: rol === 'tienda' ? 'Lun-Vie 10-20, Sáb 11-15' : null,
      latitud: rol === 'tienda' ? -33.4489 : null,
      longitud: rol === 'tienda' ? -70.6693 : null,
    };
  }
}

export async function obtenerEstadisticas(usuarioId) {
  try {
    return await apiGet(`/estadisticas/${usuarioId}`);
  } catch {
    return {
      partidas_ganadas: 12,
      partidas_perdidas: 8,
      partidas_empatadas: 1,
      torneos_participados: 3,
    };
  }
}

// TODO: endpoint real
export async function obtenerMisInscripciones() {
  return [
    { id: 1, torneo: { nombre: 'Gran Torneo Commander', fecha: '2026-05-10', formato: 'COMMANDER' } },
    { id: 2, torneo: { nombre: 'Copa Deckora', fecha: '2026-05-17', formato: 'COMMANDER' } },
  ];
}

// TODO: endpoint real
export async function obtenerTorneosDeUsuario(_usuarioId, _rol) {
  return [
    { id: 1, nombre: 'Torneo Commander #1', fecha: '2026-05-08', formato: 'COMMANDER', estado: 'pendiente', cupo_maximo: 16 },
    { id: 2, nombre: 'Liga Semanal', fecha: '2026-04-20', formato: 'COMMANDER', estado: 'finalizado', cupo_maximo: 8 },
  ];
}

export async function actualizarMiPerfil(data) {
  try {
    return await apiPatch('/usuarios/me', data);
  } catch {
    return data;
  }
}
