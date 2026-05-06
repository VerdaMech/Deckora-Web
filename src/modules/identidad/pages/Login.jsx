import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function rolADestino(rol) {
  if (rol === 'jugador') return '/jugador';
  if (rol === 'organizador') return '/organizador';
  if (rol === 'tienda') return '/tienda';
  return '/';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mostrarExito, mostrarError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const from = location.state?.from;

  async function handleSubmit(e) {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (!email) { setEmailError('El correo es obligatorio.'); return; }
    if (!validarEmail(email)) { setEmailError('Ingresá un correo válido.'); return; }
    if (!password) { setPasswordError('La contraseña es obligatoria.'); return; }

    setLoading(true);
    try {
      const data = await login(email, password);
      const rolObtenido = data?.rol ?? data?.user?.rol;
      const destino = from ?? rolADestino(rolObtenido);
      mostrarExito('Bienvenido de vuelta', 'Iniciaste sesión correctamente.');
      navigate(destino, { replace: true });
    } catch (err) {
      mostrarError('No se pudo iniciar sesión', traducirError(err));
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
          <Input
            label="Correo"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            autoComplete="email"
          />
          <div>
            <Input
              label="Contraseña"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          ¿No tenés cuenta?{' '}
          <Link to="/registro">Crear una</Link>
        </p>
      </div>
    </div>
  );
}
