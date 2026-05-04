import { useEffect, useState } from 'react';
import { Trophy, X, Minus, Swords, BarChart3 } from 'lucide-react';

import { Skeleton, EmptyState } from '@/components/ui';
import { obtenerEstadisticas } from '@/services/usuarios.service';

export default function EstadisticasJugador({ usuarioId, compact = false }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerEstadisticas(usuarioId).then(setStats).finally(() => setLoading(false));
  }, [usuarioId]);

  if (loading) {
    return (
      <div className="estadisticas-jugador">
        <Skeleton height="140px" />
      </div>
    );
  }

  const total =
    (stats?.partidas_ganadas ?? 0) +
    (stats?.partidas_perdidas ?? 0) +
    (stats?.partidas_empatadas ?? 0);
  const allZero = total === 0 && (stats?.torneos_participados ?? 0) === 0;
  const winRate = total > 0 ? ((stats.partidas_ganadas / total) * 100).toFixed(1) : null;

  if (!compact && allZero) {
    return (
      <div className="estadisticas-jugador">
        <EmptyState
          icon={BarChart3}
          title="Sin estadísticas"
          description="Todavía no jugaste partidas registradas. Tu primera victoria está esperando."
        />
      </div>
    );
  }

  return (
    <div className={`estadisticas-jugador${compact ? ' estadisticas-jugador--compact' : ''}`}>
      {!compact && <h3 className="estadisticas-jugador__titulo">Estadísticas</h3>}
      <div className="estadisticas-jugador__grid">
        <div className="estadisticas-jugador__stat">
          <Trophy size={20} className="estadisticas-jugador__stat-icon estadisticas-jugador__stat-icon--gold" />
          <span className="estadisticas-jugador__stat-value">{stats?.partidas_ganadas ?? 0}</span>
          <span className="estadisticas-jugador__stat-label">Ganadas</span>
        </div>
        <div className="estadisticas-jugador__stat">
          <X size={20} className="estadisticas-jugador__stat-icon estadisticas-jugador__stat-icon--muted" />
          <span className="estadisticas-jugador__stat-value">{stats?.partidas_perdidas ?? 0}</span>
          <span className="estadisticas-jugador__stat-label">Perdidas</span>
        </div>
        <div className="estadisticas-jugador__stat">
          <Minus size={20} className="estadisticas-jugador__stat-icon estadisticas-jugador__stat-icon--muted" />
          <span className="estadisticas-jugador__stat-value">{stats?.partidas_empatadas ?? 0}</span>
          <span className="estadisticas-jugador__stat-label">Empatadas</span>
        </div>
        <div className="estadisticas-jugador__stat">
          <Swords size={20} className="estadisticas-jugador__stat-icon estadisticas-jugador__stat-icon--gold" />
          <span className="estadisticas-jugador__stat-value">{stats?.torneos_participados ?? 0}</span>
          <span className="estadisticas-jugador__stat-label">Torneos</span>
        </div>
      </div>
      {winRate !== null && (
        <div className="estadisticas-jugador__winrate">
          <span className="estadisticas-jugador__winrate-value">{winRate}%</span>
          <span className="estadisticas-jugador__winrate-label">Win Rate</span>
        </div>
      )}
    </div>
  );
}
