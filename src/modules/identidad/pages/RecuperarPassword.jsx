import { useState } from 'react';
import { Link } from 'react-router-dom';

import { recuperarPassword } from '@/services/auth.service';
import { Button, Input, Alert } from '@/components/ui';

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!correo) { setError('El correo es obligatorio.'); return; }

    setLoading(true);
    try {
      await recuperarPassword(correo);
      setEnviado(true);
    } catch (err) {
      setError(err?.message || 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__logo">DECKORA</div>
        <h2 className="auth-card__title">Recuperar acceso</h2>

        {enviado ? (
          <>
            <Alert variant="success">
              Si el correo está registrado, vas a recibir un email con instrucciones. Revisá también el spam.
            </Alert>
            <p className="auth-form__footer">
              <Link to="/login">← Volver al login</Link>
            </p>
          </>
        ) : (
          <>
            {error && <Alert variant="danger">{error}</Alert>}

            <p className="auth-form__lead">
              Ingresá tu correo y te enviaremos un link para restablecer tu contraseña.
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <Input
                label="Correo"
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="auth-form__submit"
              >
                Enviar link
              </Button>
            </form>

            <p className="auth-form__footer">
              <Link to="/login">← Volver al login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
