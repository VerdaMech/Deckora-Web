import { useEffect, useState } from 'react';
import { Trophy, X, Minus, Swords, Layers } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

import { Spinner, Alert } from '@/components/ui';
import { obtenerEstadisticasJugador } from '@/services/usuarios.service';
import '@/styles/components/EstadisticasJugador.css';

const STAT_CARDS = [
  { key: 'partidasGanadas', label: 'Ganadas', icono: Trophy, mod: 'gold' },
  { key: 'partidasPerdidas', label: 'Perdidas', icono: X, mod: 'muted' },
  { key: 'partidasEmpatadas', label: 'Empatadas', icono: Minus, mod: 'muted' },
];

function TooltipMeses({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="estadisticas-jugador__tooltip">
      <p className="estadisticas-jugador__tooltip-mes">{label}</p>
      {payload.map((p) => (
        <p
          key={p.name}
          className={`estadisticas-jugador__tooltip-linea estadisticas-jugador__tooltip-linea--${p.dataKey}`}
        >
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function EstadisticasJugador({ usuarioId, variante = 'completo' }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    obtenerEstadisticasJugador(usuarioId)
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [usuarioId]);

  if (loading) {
    return (
      <div className="estadisticas-jugador estadisticas-jugador__spinner">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const esCompacto = variante === 'compacto';
  const winRatePct = stats.winRate != null ? (stats.winRate * 100).toFixed(1) : '—';

  return (
    <div className={`estadisticas-jugador estadisticas-jugador--${variante}`}>
      <div className="estadisticas-jugador__grid">
        {STAT_CARDS.map(({ key, label, icono: Icono, mod }) => (
          <div key={key} className="estadisticas-jugador__card">
            <Icono size={20} className={`estadisticas-jugador__card-icono estadisticas-jugador__card-icono--${mod}`} />
            <span className="estadisticas-jugador__numero">{stats[key] ?? 0}</span>
            <span className="estadisticas-jugador__label">{label}</span>
          </div>
        ))}
        <div className="estadisticas-jugador__card">
          <Swords size={20} className="estadisticas-jugador__card-icono estadisticas-jugador__card-icono--gold" />
          <span className="estadisticas-jugador__numero">{winRatePct}%</span>
          <span className="estadisticas-jugador__label">Win Rate</span>
        </div>
      </div>

      {!esCompacto && (
        <>
          <div className="estadisticas-jugador__chart">
            <h4 className="estadisticas-jugador__chart-titulo">Historial últimos meses</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.historialUltimosMeses ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="mes" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip content={<TooltipMeses />} />
                <Legend wrapperClassName="estadisticas-jugador__leyenda" />
                <Line
                  type="monotone"
                  dataKey="ganadas"
                  stroke="var(--success)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--success)' }}
                  name="Ganadas"
                />
                <Line
                  type="monotone"
                  dataKey="perdidas"
                  stroke="var(--crimson-bright)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--crimson-bright)' }}
                  name="Perdidas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="estadisticas-jugador__detalles">
            <div className="estadisticas-jugador__detalle-item">
              <Layers size={16} className="estadisticas-jugador__card-icono estadisticas-jugador__card-icono--gold" />
              <span className="estadisticas-jugador__detalle-label">Mazo más jugado</span>
              <span className="estadisticas-jugador__detalle-valor">
                {stats.mazoMasJugado?.nombre ?? '—'}
              </span>
            </div>
            <div className="estadisticas-jugador__detalle-item">
              <Trophy size={16} className="estadisticas-jugador__card-icono estadisticas-jugador__card-icono--gold" />
              <span className="estadisticas-jugador__detalle-label">Comandante favorito</span>
              <span className="estadisticas-jugador__detalle-valor">
                {stats.comandanteFavorito ?? '—'}
              </span>
            </div>
            <div className="estadisticas-jugador__detalle-item">
              <Swords size={16} className="estadisticas-jugador__card-icono estadisticas-jugador__card-icono--gold" />
              <span className="estadisticas-jugador__detalle-label">Torneos</span>
              <span className="estadisticas-jugador__detalle-valor">
                {stats.torneosParticipados ?? 0} participados
                {stats.torneosGanados > 0 && (
                  <span className="estadisticas-jugador__detalle-ganados">
                    {' · '}{stats.torneosGanados} ganado{stats.torneosGanados !== 1 ? 's' : ''}
                  </span>
                )}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
