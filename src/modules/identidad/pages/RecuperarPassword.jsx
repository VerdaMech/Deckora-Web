import { useState } from 'react';
import { Link } from 'react-router-dom';

import { recuperarPassword } from '@/services/auth.service';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';

export default function RecuperarPassword() {
  const { mostrarExito, mostrarError } = useToast();
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [correoError, setCorreoError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setCorreoError('');

    if (!correo) { setCorreoError('El correo es obligatorio.'); return; }

    setLoading(true);
    try {
      await recuperarPassword(correo);
      mostrarExito('Email enviado', 'Si el correo está registrado, recibirás instrucciones. Revisa también el spam.');
    } catch (err) {
      mostrarError('No se pudo enviar el email', traducirError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__logo">DECKORA</div>
        <h2 className="auth-card__title">Recuperar acceso</h2>

        <p className="auth-form__lead">
          Ingresa tu correo y te enviaremos un link para restablecer tu contraseña.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Correo"
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            error={correoError}
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
      </div>
    </div>
  );
}
