import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Spinner from './Spinner';
import '@/styles/components/ConfirmDialog.css';

export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'destructivo',
  requiereTexto = null,
  onConfirmar,
  onCancelar,
  cargando = false,
}) {
  const [valorTexto, setValorTexto] = useState('');
  const cancelarRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      setValorTexto('');
      setTimeout(() => cancelarRef.current?.focus(), 80);
    }
  }, [abierto]);

  const puedeConfirmar = !cargando && (!requiereTexto || valorTexto === requiereTexto);

  const varianteBtnConfirmar = variante === 'destructivo' ? 'danger' : variante === 'advertencia' ? 'warning' : 'primary';

  return (
    <Modal
      show={abierto}
      onHide={cargando ? undefined : onCancelar}
      title={titulo}
      size="md"
    >
      <p className="confirm-dialog__cuerpo" id="confirm-dialog-msg">{mensaje}</p>
      {requiereTexto && (
        <>
          <p className="confirm-dialog__texto-requerido">
            Escribe <strong>{requiereTexto}</strong> para confirmar:
          </p>
          <Input
            value={valorTexto}
            onChange={(e) => setValorTexto(e.target.value)}
            placeholder={requiereTexto}
            disabled={cargando}
            autoComplete="off"
          />
        </>
      )}
      <div className="confirm-dialog__acciones">
        <Button
          ref={cancelarRef}
          variant="secondary"
          onClick={onCancelar}
          disabled={cargando}
        >
          {textoCancelar}
        </Button>
        <Button
          variant={varianteBtnConfirmar}
          onClick={onConfirmar}
          disabled={!puedeConfirmar}
        >
          {cargando ? <Spinner size="sm" /> : textoConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
