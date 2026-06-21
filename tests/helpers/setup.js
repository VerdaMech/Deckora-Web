// Setup global de Vitest para el frontend.
// Registra los matchers de jest-dom (toBeInTheDocument, toHaveClass, etc.).
import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Variables de entorno mínimas para que src/services/supabase.js no lance al
// importarse durante los tests (en .env.test, que está gitignoreado).
vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('VITE_API_URL', '');

// Polyfills de APIs del navegador que jsdom no implementa y que usan
// recharts, bootstrap y los componentes de mapa.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver ?? ResizeObserverStub;

class IntersectionObserverStub {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
window.IntersectionObserver = window.IntersectionObserver ?? IntersectionObserverStub;

if (!window.scrollTo) {
  window.scrollTo = vi.fn();
}

// Limpia el DOM entre tests para evitar fugas de estado entre casos.
afterEach(() => {
  cleanup();
});
