import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Alert } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
import { validarEmail as validateEmail, validarRequerido } from '@/utils/validators';

function rolADestino(rol) {
  if (rol === 'jugador') return '/jugador';
  if (rol === 'organizador') return '/organizador';
  if (rol === 'tienda') return '/tienda';
  return '/';
}

function getMsgOrTrue(fn, valor) {
  const r = fn(valor);
  return r === true ? '' : r;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  function handleEmailBlur() {
    setEmailError(getMsgOrTrue(validateEmail, email));
  }

  function handlePasswordBlur() {
    setPasswordError(getMsgOrTrue(validarRequerido, password) || (password.length < 1 ? 'La contraseña es obligatoria.' : ''));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const eErr = getMsgOrTrue(validateEmail, email);
    const pErr = password ? '' : 'La contraseña es obligatoria.';
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoginError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const rolObtenido = data?.rol ?? data?.user?.rol;
      const destino = rolADestino(rolObtenido);
      mostrarExito('Bienvenido de vuelta', 'Iniciaste sesión correctamente.');
      navigate(destino, { replace: true });
    } catch (err) {
      const msg = traducirError(err);
      setLoginError(msg);
      mostrarError('No se pudo iniciar sesión', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__logo">DECKORA</div>
        <h2 className="auth-card__title">Bienvenido de vuelta</h2>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {loginError && (
            <Alert variant="danger">{loginError}</Alert>
          )}
          <Input
            label="Correo"
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
            onBlur={handleEmailBlur}
            error={emailError}
            autoComplete="email"
          />
          <div>
            <Input
              label="Contraseña"
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
              onBlur={handlePasswordBlur}
              error={passwordError}
              autoComplete="current-password"
            />
            <Link to="/recuperar" className="auth-form__forgot">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="auth-form__submit"
          >
            Iniciar sesión
          </Button>
        </form>

        <p className="auth-form__footer">
          ¿No tienes cuenta?{' '}
          <Link to="/registro">Crear una</Link>
        </p>
      </div>
    </div>
  );
}
