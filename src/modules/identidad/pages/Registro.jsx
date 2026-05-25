import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Alert } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
import SelectorRol from '../components/SelectorRol';

const NOMBRE_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

function rolADestino(rol) {
  if (rol === 'jugador') return '/jugador';
  if (rol === 'organizador') return '/organizador';
  if (rol === 'tienda') return '/tienda';
  return '/';
}

export default function Registro() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useToast();

  const [rol, setRol] = useState('jugador');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [nombreTienda, setNombreTienda] = useState('');

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [registroError, setRegistroError] = useState('');
  const [emailPendiente, setEmailPendiente] = useState(false);

  function validar() {
    const errs = {};
    if (!nombreUsuario) errs.nombreUsuario = 'El nombre de usuario es obligatorio.';
    else if (!NOMBRE_REGEX.test(nombreUsuario))
      errs.nombreUsuario = 'Solo letras, números, guión y guión bajo. Entre 3 y 30 caracteres.';
    if (!correo) errs.correo = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errs.correo = 'Ingresa un correo válido.';
    if (!password) errs.password = 'La contraseña es obligatoria.';
    else if (password.length < 8) errs.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (!confirmacion) errs.confirmacion = 'Confirma tu contraseña.';
    else if (password !== confirmacion) errs.confirmacion = 'Las contraseñas no coinciden.';
    if (rol === 'tienda' && !nombreTienda) errs.nombreTienda = 'El nombre de la tienda es obligatorio.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validar();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setRegistroError('');
    setLoading(true);
    try {
      const data = await signup({
        email: correo,
        password,
        nombre_usuario: nombreUsuario,
        rol,
        nombre_tienda: rol === 'tienda' ? nombreTienda : undefined,
      });
      if (data?.requiresEmailVerification) {
        setEmailPendiente(true);
        return;
      }
      const rolObtenido = data?.rol ?? data?.user?.rol ?? rol;
      mostrarExito('Cuenta creada', 'Bienvenido a Deckora. ¡A jugar!');
      navigate(rolADestino(rolObtenido), { replace: true });
    } catch (err) {
      const msg = traducirError(err);
      setRegistroError(msg);
      mostrarError('No se pudo crear la cuenta', msg);
    } finally {
      setLoading(false);
    }
  }

  if (emailPendiente) {
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <div className="auth-card__logo">DECKORA</div>
          <h2 className="auth-card__title">Verifica tu correo</h2>
          <p className="auth-card__subtitle">
            Te enviamos un enlace de verificación a <strong>{correo}</strong>.
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <p className="auth-form__footer" style={{ marginTop: '1.5rem' }}>
            ¿Ya verificaste?{' '}
            <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__logo">DECKORA</div>
        <h2 className="auth-card__title">Crear cuenta</h2>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {registroError && (
            <Alert variant="danger">{registroError}</Alert>
          )}
          <SelectorRol value={rol} onChange={setRol} disabled={loading} />

          <Input
            label="Nombre de usuario"
            required
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            error={fieldErrors.nombreUsuario}
            autoComplete="username"
          />

          <Input
            label="Correo"
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            error={fieldErrors.correo}
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete="new-password"
          />

          <Input
            label="Confirmar contraseña"
            type="password"
            required
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            error={fieldErrors.confirmacion}
            autoComplete="new-password"
          />

          {rol === 'tienda' && (
            <Input
              label="Nombre de la tienda"
              required
              value={nombreTienda}
              onChange={(e) => setNombreTienda(e.target.value)}
              error={fieldErrors.nombreTienda}
            />
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="auth-form__submit"
          >
            Crear cuenta
          </Button>
        </form>

        <p className="auth-form__footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
