import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Alert } from '@/components/ui';

const SUPABASE_ERROR_MAP = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Debés confirmar tu correo antes de ingresar.',
  'Too many requests': 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
};

function traducirError(msg) {
  for (const [clave, traduccion] of Object.entries(SUPABASE_ERROR_MAP)) {
    if (msg?.includes(clave)) return traduccion;
  }
  return msg || 'Ocurrió un error. Intentá de nuevo.';
}

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const from = location.state?.from;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!email) { setEmailError('El correo es obligatorio.'); return; }
    if (!validarEmail(email)) { setEmailError('Ingresá un correo válido.'); return; }
    if (!password) { setError('La contraseña es obligatoria.'); return; }

    setLoading(true);
    try {
      const data = await login(email, password);
      const rolObtenido = data?.rol ?? data?.user?.rol;
      const destino = from ?? rolADestino(rolObtenido);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(traducirError(err?.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__logo">DECKORA</div>
        <h2 className="auth-card__title">Bienvenido de vuelta</h2>

        {error && (
          <Alert variant="danger">{error}</Alert>
        )}

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
