import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBadge from '@/components/domain/RoleBadge';

// ═══════════════════════════════════════════════════════════════════════════
// OWASP A05:2025 — XSS en el frontend
//
// Una búsqueda en todo `src/` no encontró NINGÚN uso de `dangerouslySetInnerHTML`,
// `innerHTML` ni `v-html`. Todo el contenido dinámico (incluido el que proviene
// de la API) se renderiza con JSX, que escapa el HTML por defecto. Por lo tanto el
// frontend no expone un vector de XSS por inyección de HTML.
//
// Estos tests documentan y confirman ese comportamiento: un valor con `<script>`
// o un `<img onerror=...>` se renderiza como TEXTO, no como nodos del DOM.
// ═══════════════════════════════════════════════════════════════════════════

describe('A05 (frontend) — React/JSX escapa HTML en contenido dinámico', () => {
  it('TC-SEC-A05-W01: un valor con <script> se muestra como texto, no como HTML ejecutable', () => {
    const payload = "<script>alert('xss')</script>";
    const { container } = render(<RoleBadge rol={payload} />);

    // Si el texto aparece literal, React lo escapó correctamente.
    expect(screen.getByText(payload)).toBeInTheDocument();
    // No se creó ningún elemento <script> real en el DOM.
    expect(container.querySelector('script')).toBeNull();
  });

  it('TC-SEC-A05-W02: un <img onerror=...> inyectado no genera un elemento <img> con handler', () => {
    const payload = '<img src=x onerror=alert(1)>';
    const { container } = render(<RoleBadge rol={payload} />);

    expect(screen.getByText(payload)).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });
});
