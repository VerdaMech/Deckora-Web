import { BarraAgregarCarta } from '@/modules/mazos/components/BarraAgregarCarta';
import { PanelValidacion } from '@/modules/mazos/components/PanelValidacion';
import { DeckList } from './DeckList';
import { DeckStats } from './DeckStats';
import './DeckBuilder.css';

export function DeckBuilder({
  mazo,
  cartas,
  validacion,
  validacionCargando,
  comandanteId,
  onAgregarCarta,
  onCantidadChange,
  onEliminar,
  onMarcarComandante,
  slotAsistenteIA,
}) {
  return (
    <div className="deck-builder">
      <div className="deck-builder__col deck-builder__col--buscador">
        <h3 className="deck-builder__col-titulo">Agregar cartas</h3>
        <BarraAgregarCarta onAgregar={onAgregarCarta} modoPanel />
      </div>

      <div className="deck-builder__col deck-builder__col--lista">
        <h3 className="deck-builder__col-titulo">Lista del mazo</h3>
        {cartas.length === 0 ? (
          <p className="deck-builder__lista-vacia">Busca tu primera carta a la izquierda.</p>
        ) : (
          <DeckList
            cartas={cartas}
            comandanteId={comandanteId}
            formato={mazo?.formato}
            editable
            onCantidadChange={onCantidadChange}
            onEliminar={onEliminar}
            onMarcarComandante={onMarcarComandante}
          />
        )}
      </div>

      <div className="deck-builder__col deck-builder__col--stats">
        <h3 className="deck-builder__col-titulo">Estadísticas</h3>
        <DeckStats cartas={cartas} formato={mazo?.formato} comandanteId={comandanteId} />

        <div className="deck-builder__validacion">
          <h3 className="deck-builder__col-titulo">Validación</h3>
          <PanelValidacion
            validacion={validacion}
            cargando={validacionCargando}
            formato={mazo?.formato}
            totalCartas={cartas.reduce((s, c) => s + (c.cantidad ?? 1), 0)}
          />
        </div>

        {slotAsistenteIA && (
          <div className="deck-builder__asistente">
            {slotAsistenteIA}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeckBuilder;
