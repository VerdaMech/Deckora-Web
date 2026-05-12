import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const DEFAULTS = {
  titulo: 'Confirmar',
  mensaje: '¿Estás seguro?',
  textoConfirmar: 'Confirmar',
  textoCancelar: 'Cancelar',
  variante: 'destructivo',
  requiereTexto: null,
  onConfirmar: null,
};

export function useConfirmDialog() {
  const [config, setConfig] = useState(null);
  const [cargando, setCargando] = useState(false);

  function confirmar(opciones) {
    setConfig({ ...DEFAULTS, ...opciones });
  }

  function cerrar() {
    if (cargando) return;
    setConfig(null);
  }

  async function handleConfirmar() {
    if (!config?.onConfirmar) { cerrar(); return; }
    setCargando(true);
    try {
      await config.onConfirmar();
      setConfig(null);
    } finally {
      setCargando(false);
    }
  }

  function ConfirmDialogPortal() {
    if (!config) return null;
    return (
      <ConfirmDialog
        abierto={!!config}
        titulo={config.titulo}
        mensaje={config.mensaje}
        textoConfirmar={config.textoConfirmar}
        textoCancelar={config.textoCancelar}
        variante={config.variante}
        requiereTexto={config.requiereTexto}
        onConfirmar={handleConfirmar}
        onCancelar={cerrar}
        cargando={cargando}
      />
    );
  }

  return { confirmar, ConfirmDialogPortal };
}
