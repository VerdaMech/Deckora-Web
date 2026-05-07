import { useState } from 'react';

import { Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { useConfirmDialog } from '@/hooks/useConfirmDialog.jsx';
import { traducirError } from '@/utils/errors';
import { supabase } from '@/services/supabase';
import { apiDelete } from '@/services/api';

export default function CuentaTab() {
  const { user, logout } = useAuth();
  const { mostrarExito, mostrarError } = useToast();
  const { confirmar, ConfirmDialogPortal } = useConfirmDialog();
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGuardar(e) {
    e.preventDefault();
    setLocalError('');
    if (nuevaPassword && nuevaPassword !== confirmarPassword) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }
    if (nuevaPassword && nuevaPassword.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const updates = {};
    if (nuevaPassword) updates.password = nuevaPassword;
    if (nuevoCorreo) updates.email = nuevoCorreo;
    if (!Object.keys(updates).length) {
      setLocalError('No hay cambios para guardar.');
      return;
    }
    setLoading(true);
    try {
      const { error: supabaseError } = await supabase.auth.updateUser(updates);
      if (supabaseError) throw supabaseError;
      mostrarExito(
        'Cambios guardados',
        nuevoCorreo
          ? 'Revisa tu correo para confirmar el nuevo email.'
          : 'Contraseña actualizada correctamente.'
      );
      setNuevoCorreo('');
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (err) {
      mostrarError('No se pudo guardar', traducirError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSolicitarEliminar() {
    confirmar({
      titulo: 'Eliminar cuenta',
      mensaje: 'Esto borrará tu cuenta y todos tus datos. La acción es permanente e irreversible.',
      textoConfirmar: 'Eliminar definitivamente',
      variante: 'destructivo',
      requiereTexto: 'ELIMINAR',
      onConfirmar: async () => {
        try {
          await apiDelete('/usuarios/me');
          await logout();
        } catch (err) {
          mostrarError('No se pudo eliminar la cuenta', traducirError(err));
        }
      },
    });
  }

  return (
    <div>
      <div className="config-section">
        <h2 className="config-section__title">Cuenta</h2>
        <form onSubmit={handleGuardar} className="config-form">
          {localError && <p className="config-form__error">{localError}</p>}
          <Input label="Correo actual" value={user?.email ?? ''} readOnly />
          <Input
            label="Nuevo correo"
            type="email"
            value={nuevoCorreo}
            onChange={(e) => setNuevoCorreo(e.target.value)}
            placeholder="Deja vacío si no quieres cambiarlo"
          />
          <Input
            label="Nueva contraseña"
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
          />
          <Button type="submit" variant="primary" loading={loading}>
            Guardar cambios
          </Button>
        </form>
      </div>

      <div className="config-section config-section--danger">
        <h3 className="config-section__title">Eliminar cuenta</h3>
        <p className="config-section__warning">
          Esto borrará tu cuenta y todos tus datos. La acción es permanente.
        </p>
        <Button variant="danger" onClick={handleSolicitarEliminar}>
          Eliminar mi cuenta
        </Button>
      </div>

      <ConfirmDialogPortal />
    </div>
  );
}
