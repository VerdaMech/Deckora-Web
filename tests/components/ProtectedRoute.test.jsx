import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════════════
// OWASP A06:2025 — Diseño inseguro (protección de rutas por rol en el frontend)
//
// El guard `ProtectedRoute` redirige a /login si no hay sesión y a /forbidden si
// el rol no está autorizado. El flujo completo lo cubre el E2E TC-E2E-010; aquí se
// valida el guard de forma unitaria, sin levantar toda la app, mockeando useAuth.
// ═══════════════════════════════════════════════════════════════════════════

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/components/ui', () => ({ Spinner: () => <div>cargando</div> }));

import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/routes/ProtectedRoute';

function renderRutaProtegida(requireRol, rolUsuario, { autenticado = true, loading = false } = {}) {
  useAuth.mockReturnValue({
    user: autenticado ? { id: 'u1' } : null,
    rol: rolUsuario,
    loading,
  });

  return render(
    <MemoryRouter initialEntries={['/organizador']}>
      <Routes>
        <Route
          path="/organizador"
          element={
            <ProtectedRoute requireRol={requireRol}>
              <div>Panel Organizador</div>
            </ProtectedRoute>
          }
        />
        <Route path="/forbidden" element={<div>Pagina Forbidden</div>} />
        <Route path="/login" element={<div>Pagina Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('A06 (frontend) — ProtectedRoute', () => {
  it('TC-SEC-A06-W01: un jugador en una ruta de organizador es redirigido a /forbidden', () => {
    renderRutaProtegida('organizador', 'jugador');

    expect(screen.getByText('Pagina Forbidden')).toBeInTheDocument();
    expect(screen.queryByText('Panel Organizador')).not.toBeInTheDocument();
  });

  it('TC-SEC-A06-W02: un usuario sin sesión es redirigido a /login', () => {
    renderRutaProtegida('organizador', null, { autenticado: false });

    expect(screen.getByText('Pagina Login')).toBeInTheDocument();
    expect(screen.queryByText('Panel Organizador')).not.toBeInTheDocument();
  });

  it('TC-SEC-A06-W03: el rol autorizado accede al contenido protegido', () => {
    renderRutaProtegida('organizador', 'organizador');

    expect(screen.getByText('Panel Organizador')).toBeInTheDocument();
  });

  it('TC-SEC-A06-W04: requireRol="any" permite a cualquier usuario autenticado', () => {
    renderRutaProtegida('any', 'jugador');

    expect(screen.getByText('Panel Organizador')).toBeInTheDocument();
  });
});
