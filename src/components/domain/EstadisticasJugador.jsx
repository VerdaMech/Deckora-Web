import { useEffect, useState } from 'react';
import { Trophy, X, Minus, Swords, Layers } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

import { Spinner, Alert } from '@/components/ui';
import UITooltip from '@/components/ui/Tooltip';
import { obtenerEstadisticasJugador, obtenerHistorialDiario } from '@/services/usuarios.service';
import '@/styles/components/EstadisticasJugador.css';

const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function mesAEspanol(mesKey) {
  const n = parseInt(mesKey?.split('-')[1], 10);
  return Number.isNaN(n) ? mesKey : (MESES_ES[n - 1] ?? mesKey);
}

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
  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const [historialDiario, setHistorialDiario] = useState([]);
  const [loadingDiario, setLoadingDiario] = useState(false);

  useEffect(() => {
    setLoading(true);
    obtenerEstadisticasJugador(usuarioId)
      .then((data) => {
        setStats(data);
        setMesSeleccionado(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [usuarioId]);

  useEffect(() => {
    if (!mesSeleccionado || !usuarioId) {
      setHistorialDiario([]);
      return;
    }
    setLoadingDiario(true);
    obtenerHistorialDiario(usuarioId, mesSeleccionado)
      .then(setHistorialDiario)
      .catch(() => setHistorialDiario([]))
      .finally(() => setLoadingDiario(false));
  }, [mesSeleccionado, usuarioId]);

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
  const historial = stats.historialUltimosMeses ?? [];
  const datosGrafico = mesSeleccionado ? historialDiario : historial;
  const claveX = mesSeleccionado ? 'dia' : 'mes_key';

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
          <UITooltip content="Porcentaje de partidas ganadas sobre el total jugado." placement="top">
            <span className="estadisticas-jugador__label">Win Rate</span>
          </UITooltip>
        </div>
      </div>

      {!esCompacto && (
        <>
          <div className="estadisticas-jugador__chart">
            <div className="estadisticas-jugador__chart-cabecera">
              <h4 className="estadisticas-jugador__chart-titulo">Historial últimos meses</h4>
              {historial.length > 0 && (
                <select
                  className="estadisticas-jugador__select-mes"
                  value={mesSeleccionado ?? ''}
                  onChange={(e) => setMesSeleccionado(e.target.value || null)}
                >
                  <option value="">Todos los meses</option>
                  {historial.map(({ mes_key }) => (
                    <option key={mes_key} value={mes_key}>{mesAEspanol(mes_key)}</option>
                  ))}
                </select>
              )}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={loadingDiario ? [] : datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey={claveX}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickFormatter={claveX === 'mes_key' ? mesAEspanol : undefined}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  allowDecimals={false}
                  tickFormatter={(v) => Math.round(v)}
                />
                <Tooltip content={<TooltipMeses />} />
                <Legend wrapperClassName="estadisticas-jugador__leyenda" />
                <Line
                  type="linear"
                  dataKey="ganadas"
                  stroke="var(--success)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--success)' }}
                  name="Ganadas"
                />
                <Line
                  type="linear"
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
