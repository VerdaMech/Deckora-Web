import { useState } from 'react';
import { BarraAgregarCarta } from '@/modules/mazos/components/BarraAgregarCarta';
import { PanelValidacion } from '@/modules/mazos/components/PanelValidacion';
import { AsistenteIA } from '@/modules/mazos/components/AsistenteIA';
import { DeckList } from './DeckList';
import { DeckStats } from './DeckStats';
import { CartaDetalleModal } from './CartaDetalleModal';
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
  onAplicarSugerencia,
}) {
  const [cartaDetalle, setCartaDetalle] = useState(null);

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
            onCartaClick={(entrada) => setCartaDetalle(entrada.carta ?? entrada)}
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

        <div className="deck-builder__asistente">
          <AsistenteIA mazo={mazo} onAplicarSugerencia={onAplicarSugerencia} />
        </div>
      </div>

      <CartaDetalleModal carta={cartaDetalle} onClose={() => setCartaDetalle(null)} />
    </div>
  );
}

export default DeckBuilder;
