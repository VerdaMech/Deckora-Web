import { ESTADO_TORNEO } from './constants';

export function cupoDisponible(torneo) {
  if (!torneo) return false;
  if (!torneo.cupo_maximo) return true;
  return (torneo.inscritos_count ?? 0) < torneo.cupo_maximo;
}

export function puedeInscribirse(torneo, usuario, inscripciones = []) {
  if (!torneo || !usuario) return false;
  if (usuario.rol !== 'jugador') return false;
  if (torneo.estado !== ESTADO_TORNEO.PENDIENTE) return false;
  if (!cupoDisponible(torneo)) return false;
  const yaInscrito = inscripciones.some(
    (i) => i.usuario_id === usuario.id || i.jugador_id === usuario.id
  );
  return !yaInscrito;
}

export function estadoVisualTorneo(torneo) {
  if (!torneo) return '';
  switch (torneo.estado) {
    case ESTADO_TORNEO.PENDIENTE: return 'pendiente';
    case ESTADO_TORNEO.EN_CURSO: return 'en_curso';
    case ESTADO_TORNEO.FINALIZADO: return 'finalizado';
    case ESTADO_TORNEO.CANCELADO: return 'cancelado';
    default: return torneo.estado ?? '';
  }
}
