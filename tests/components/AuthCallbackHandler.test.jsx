import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

const { navigate, toast, authState } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: { mostrarExito: vi.fn() },
  authState: { value: {} },
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));

import AuthCallbackHandler from '@/components/AuthCallbackHandler';

beforeEach(() => {
  vi.clearAllMocks();
  authState.value = { user: null, rol: null, loading: false };
  window.location.hash = '';
});

afterEach(() => { window.location.hash = ''; });

describe('AuthCallbackHandler', () => {
  it('no hace nada sin hash de verificación', () => {
    authState.value = { user: { id: 1 }, rol: 'jugador', loading: false };
    render(<AuthCallbackHandler />);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redirige según el rol tras confirmar el correo', async () => {
    window.location.hash = '#access_token=abc&type=signup';
    authState.value = { user: { id: 1 }, rol: 'organizador', loading: false };
    render(<AuthCallbackHandler />);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/organizador', { replace: true }));
    expect(toast.mostrarExito).toHaveBeenCalled();
  });
});
