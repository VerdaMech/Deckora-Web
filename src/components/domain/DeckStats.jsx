import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { calcularCurva, calcularDistribucionColor, agruparPorTipo, contarCartasMazo } from '@/utils/deck-helpers';
import { EmptyState } from '@/components/ui';
import './DeckStats.css';

const COLOR_LABELS = { W: 'Blanco', U: 'Azul', B: 'Negro', R: 'Rojo', G: 'Verde', C: 'Incoloro' };
const COLOR_HEX = { W: '#f8f6d8', U: '#aae0fa', B: '#8a7060', R: '#f9aa8f', G: '#9bd3ae', C: '#ccc2c0' };

const FORMATO_LIMITE = {
  COMMANDER: 100, STANDARD: 60, MODERN: 60, LEGACY: 60, VINTAGE: 60, PIONEER: 60, PAUPER: 60,
};

const TIPO_LABELS = {
  comandante: 'Comandante', criaturas: 'Criaturas', tierras: 'Tierras',
  instantaneos: 'Instantáneos', conjuros: 'Conjuros', artefactos: 'Artefactos',
  encantamientos: 'Encantamientos', planeswalkers: 'Planeswalkers', otros: 'Otros',
};

const TIPO_COLORS = ['#e8c96a', '#4a8c5e', '#5a7fa0', '#c98c2c', '#a06fc4', '#c0392b', '#9bd3ae', '#7a6a58', '#c9a84c'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#160e16', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 4 },
  labelStyle: { color: '#d4c5b0' },
  itemStyle: { color: '#c9a84c' },
};

function validarLocal(cartas, formato, comandanteId) {
  const total = contarCartasMazo(cartas);
  const limite = FORMATO_LIMITE[formato?.toUpperCase()] ?? 60;
  const esCommander = formato?.toUpperCase() === 'COMMANDER';
  const tieneComandante = !!comandanteId || cartas.some((c) => c.esComandante);

  const problemas = [];

  if (total < limite) {
    const diff = limite - total;
    problemas.push(`Faltan ${diff} carta${diff !== 1 ? 's' : ''} para llegar a ${limite}.`);
  } else if (total > limite) {
    const diff = total - limite;
    problemas.push(`El mazo tiene ${diff} carta${diff !== 1 ? 's' : ''} de más (máximo ${limite}).`);
  }

  if (esCommander && !tieneComandante) {
    problemas.push('Falta asignar un comandante.');
  }

  if (problemas.length === 0) return { variant: 'success', texto: 'Mazo válido', problemas };

  const cercaDelLimite = total >= limite - 5 && total <= limite + 5;
  if (cercaDelLimite && (!esCommander || tieneComandante)) {
    return { variant: 'warning', texto: 'Con observaciones', problemas };
  }

  return { variant: 'danger', texto: 'Mazo inválido', problemas };
}

export function DeckStats({ cartas = [], formato = 'COMMANDER', comandanteId }) {
  const curva = useMemo(() => calcularCurva(cartas), [cartas]);
  const distColor = useMemo(() => calcularDistribucionColor(cartas), [cartas]);
  const grupos = useMemo(() => agruparPorTipo(cartas), [cartas]);
  const total = useMemo(() => contarCartasMazo(cartas), [cartas]);
  const estado = useMemo(() => validarLocal(cartas, formato, comandanteId), [cartas, formato, comandanteId]);

  const limite = FORMATO_LIMITE[formato?.toUpperCase()] ?? 60;

  const colorData = useMemo(
    () =>
      Object.entries(distColor)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: COLOR_LABELS[k] ?? k, value: v, color: COLOR_HEX[k] ?? '#999' })),
    [distColor],
  );

  const tipoData = useMemo(
    () =>
      Object.entries(grupos)
        .filter(([k, arr]) => k !== 'comandante' && arr.length > 0)
        .map(([k, arr], i) => ({
          name: TIPO_LABELS[k] ?? k,
          value: arr.reduce((s, e) => s + (e.cantidad ?? 1), 0),
          color: TIPO_COLORS[i % TIPO_COLORS.length],
        })),
    [grupos],
  );

  if (cartas.length === 0) {
    return (
      <div className="deck-stats deck-stats--empty">
        <EmptyState
          icon={BarChart3}
          title="Sin estadísticas"
          description="Agrega cartas al mazo para ver las estadísticas."
        />
      </div>
    );
  }

  const EstadoIcon =
    estado.variant === 'success' ? CheckCircle2 : estado.variant === 'warning' ? AlertTriangle : XCircle;

  return (
    <div className="deck-stats">
      <div className="deck-stats__total">
        <span className="deck-stats__total-numero">{total}</span>
        <span className="deck-stats__total-limite">/ {limite}</span>
        <span className="deck-stats__total-label">cartas</span>
      </div>

      <div className="deck-stats__estado">
        <div className={`deck-stats__estado-badge deck-stats__estado-badge--${estado.variant}`}>
          <EstadoIcon size={14} />
          <span>{estado.texto}</span>
        </div>
        {estado.problemas.length > 0 && (
          <ul className="deck-stats__problemas">
            {estado.problemas.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="deck-stats__grid">
        <div className="deck-stats__chart deck-stats__chart--curva">
          <h4 className="deck-stats__chart-titulo">Curva de maná</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={curva} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="cmc" tick={{ fill: '#7a6a58', fontSize: 11 }} />
              <YAxis tick={{ fill: '#7a6a58', fontSize: 11 }} allowDecimals={false} />
              <RTooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#c9a84c" radius={[2, 2, 0, 0]} name="Cartas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="deck-stats__chart deck-stats__chart--identidad">
          <h4 className="deck-stats__chart-titulo">Identidad de color</h4>
          {colorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={colorData} dataKey="value" nameKey="name" cx="50%" cy="42%" outerRadius="70%">
                  {colorData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <RTooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#7a6a58' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="deck-stats__chart-empty">Sin datos de color.</p>
          )}
        </div>

        <div className="deck-stats__chart deck-stats__chart--tipos">
          <h4 className="deck-stats__chart-titulo">Por tipos</h4>
          {tipoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={tipoData} dataKey="value" nameKey="name" cx="50%" cy="42%" outerRadius="70%" innerRadius="28%">
                  {tipoData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <RTooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#7a6a58' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="deck-stats__chart-empty">Sin datos de tipos.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeckStats;
