import { useState } from 'react';

import { Input, Button, Modal, Alert } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';

export default function CuentaTab() {
  const { user, logout } = useAuth();
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    setExito('');
    if (nuevaPassword && nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (nuevaPassword && nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const updates = {};
    if (nuevaPassword) updates.password = nuevaPassword;
    if (nuevoCorreo) updates.email = nuevoCorreo;
    if (!Object.keys(updates).length) {
      setError('No hay cambios para guardar.');
      return;
    }
    setLoading(true);
    try {
      const { error: supabaseError } = await supabase.auth.updateUser(updates);
      if (supabaseError) throw supabaseError;
      setExito(
        nuevoCorreo
          ? 'Cambios guardados. Revisá tu correo para confirmar el nuevo email.'
          : 'Contraseña actualizada correctamente.'
      );
      setNuevoCorreo('');
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (err) {
      setError(err.message ?? 'Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminarCuenta() {
    if (confirmUsername !== (user?.nombre_usuario ?? user?.email)) return;
    // TODO: endpoint real DELETE /usuarios/me
    await logout();
  }

  const usernameConfirm = user?.nombre_usuario ?? user?.email ?? '';

  return (
    <div>
      <div className="config-section">
        <h2 className="config-section__title">Cuenta</h2>
        <form onSubmit={handleGuardar} className="config-form">
          {error && <Alert variant="danger">{error}</Alert>}
          {exito && <Alert variant="success">{exito}</Alert>}
          <Input label="Correo actual" value={user?.email ?? ''} readOnly />
          <Input
            label="Nuevo correo"
            type="email"
            value={nuevoCorreo}
            onChange={(e) => setNuevoCorreo(e.target.value)}
            placeholder="Dejá vacío si no querés cambiarlo"
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
          Esto va a borrar tu cuenta y todos tus datos. La acción es permanente.
        </p>
        <Button variant="danger" onClick={() => setShowModalEliminar(true)}>
          Eliminar mi cuenta
        </Button>
      </div>

      <Modal
        show={showModalEliminar}
        onHide={() => { setShowModalEliminar(false); setConfirmUsername(''); }}
        title="Confirmar eliminación de cuenta"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModalEliminar(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={confirmUsername !== usernameConfirm}
              onClick={handleEliminarCuenta}
            >
              Eliminar definitivamente
            </Button>
          </>
        }
      >
        <p className="config-section__warning">
          Escribí <strong>{usernameConfirm}</strong> para confirmar:
        </p>
        <Input
          value={confirmUsername}
          onChange={(e) => setConfirmUsername(e.target.value)}
          placeholder={usernameConfirm}
        />
      </Modal>
    </div>
  );
}
