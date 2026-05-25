import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';

function rolADestino(rol) {
  if (rol === 'jugador') return '/jugador';
  if (rol === 'organizador') return '/organizador';
  if (rol === 'tienda') return '/tienda';
  return '/';
}

export default function AuthCallbackHandler() {
  const { user, rol, loading } = useAuth();
  const navigate = useNavigate();
  const { mostrarExito } = useToast();
  const isPendingRef = useRef(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=signup') && hash.includes('access_token')) {
      isPendingRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isPendingRef.current || doneRef.current) return;
    if (!loading && user && rol) {
      doneRef.current = true;
      window.history.replaceState(null, '', window.location.pathname);
      mostrarExito('Cuenta verificada', '¡Tu correo fue confirmado! Bienvenido a Deckora.');
      navigate(rolADestino(rol), { replace: true });
    }
  }, [loading, user, rol, navigate, mostrarExito]);

  return null;
}
