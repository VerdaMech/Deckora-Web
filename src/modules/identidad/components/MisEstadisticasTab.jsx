import EstadisticasJugador from '@/components/domain/EstadisticasJugador';
import './MisEstadisticasTab.css';

export default function MisEstadisticasTab({ usuarioId }) {
  return (
    <div className="mis-estadisticas-tab">
      <h3 className="mis-estadisticas-tab__titulo">Mis estadísticas</h3>
      <p className="mis-estadisticas-tab__intro">
        Seguimiento de tu rendimiento en partidas y torneos de Commander registrados en Deckora.
      </p>
      <EstadisticasJugador usuarioId={usuarioId} variante="completo" />
    </div>
  );
}
