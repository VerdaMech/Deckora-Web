# Deckora — Project TODO

Estado vivo del proyecto frontend. Cada item se marca `[x]` cuando se completa.
Este documento es para que cualquier persona (humana o IA) que entre al proyecto sepa exactamente dónde estamos parados.

Última actualización: 2026-05-02

---

## Estado general

- [ ] **Fase 1 — Fundamentos** (Sprint 0)
- [ ] **Fase 2 — Identidad** (auth + perfiles)
- [ ] **Fase 3 — Mazos y Colecciones**
- [ ] **Fase 4 — Torneos**
- [ ] **Fase 5 — Mapa y Dashboards**
- [ ] **Fase 6 — Pulido final**

---

## Fase 1 — Fundamentos

Objetivo: dejar la app corriendo con layout, rutas placeholder, design system y todos los componentes UI base.

### Persona A (esta sesión)

- [x] **Commit 1** · `chore: initialize project structure with vite, eslint and project todo`
  - [x] Vite + React + dependencias instaladas
  - [x] Estructura de carpetas según spec sección 13
  - [x] vite.config.js con aliases @/
  - [x] jsconfig.json
  - [x] ESLint + Prettier configurados
  - [x] .env.example
  - [x] README.md
  - [x] PROJECT_TODO.md (este archivo)

- [x] **Commit 2** · `feat(styles): add design tokens, typography, base styles and enums`
  - [x] src/styles/tokens.css (todas las variables)
  - [x] src/styles/base.css (reset + grain overlay)
  - [x] src/styles/typography.css (Google Fonts + escala)
  - [x] src/styles/components.css (vacío inicial)
  - [x] src/styles/index.css (entry point)
  - [x] src/utils/constants.js (todos los enums)
  - [x] App.jsx con verificación visual de tokens

- [x] **Commit 3** · `feat(ui): add core ui components (button, card, input, select, textarea, spinner)`
  - [x] Button (5 variantes, 3 tamaños, loading)
  - [x] Card (4 variantes)
  - [x] Input (con label, helper, error, required)
  - [x] Select
  - [x] Textarea
  - [x] Spinner
  - [x] Clases CSS en components.css
  - [x] index.js con re-exports
  - [x] Sandbox en App.jsx

### Persona B (próxima sesión, después del PR de A)

- [x] **Commit 4** · `feat(ui): add remaining ui components (modal, badge, empty-state, tabs, alert, tooltip, skeleton)`
  - [x] Modal.jsx (wrapper react-bootstrap con override visual completo)
  - [x] Badge.jsx (variantes: format, estado, rol, resultado, default)
  - [x] EmptyState.jsx (icon + title + description + action)
  - [x] Tabs.jsx (compuesto Tabs + Tabs.Tab, estilo underline)
  - [x] Alert.jsx (variantes: success, warning, danger, info)
  - [x] Tooltip.jsx (wrapper OverlayTrigger con override CSS)
  - [x] Skeleton.jsx (shimmer animation)
  - [x] CSS en components.css (también Navbar, Sidebar, Footer, AppLayout CSS agregado)
  - [x] index.js actualizado con los 7 nuevos exports
  - [x] App.jsx extendido con sandbox Set 2
- [x] **Commit 5** · `feat(auth): agregar cliente supabase, contexto de auth, helper api y ruta protegida`
  - [x] src/services/supabase.js
  - [x] src/services/api.js (apiFetch + apiGet/Post/Patch/Put/Delete)
  - [x] src/context/AuthContext.jsx (AuthProvider + useAuth)
  - [x] src/hooks/useAuth.js (re-export)
  - [x] src/routes/ProtectedRoute.jsx
  - [x] App.jsx con panel de auth temporal (se elimina en Commit 6)
- [ ] **Commit 6** · `feat(layout): add navbar, sidebar, footer, app layout and routes skeleton`

---

## Fase 2 — Identidad

Objetivo: que un usuario pueda registrarse, loguearse y ver su perfil.

- [ ] Login (`/login`)
- [ ] Registro con selector de rol (`/registro`)
- [ ] Recuperar contraseña (`/recuperar`)
- [ ] Perfil de jugador (minimalista, sin formato preferido ni inscripciones próximas; con stats básicas)
- [ ] Perfil de organizador (sin badge verificado)
- [ ] Perfil de tienda
- [ ] Configuración de cuenta (tabs: cuenta, configuración tienda si rol tienda)

## Fase 3 — Mazos y Colecciones

- [ ] Mis colecciones (lista)
- [ ] Detalle de colección con barra de agregar cartas integrada
- [ ] Mis mazos (lista)
- [ ] Crear mazo (modal)
- [ ] Detalle de mazo (modo lectura + modo edición = deck builder + asistente IA mockeado)
- [ ] Componentes dominio: MTGCard, ManaCost, DeckList, DeckStats, DeckBuilder, ColeccionEditor

## Fase 4 — Torneos

- [ ] Cartelera (`/torneos`)
- [ ] Detalle torneo + inscripción
- [ ] Crear / editar torneo
- [ ] Gestión torneo en vivo
- [ ] Tabs en perfiles: Mis inscripciones (jugador), Mis torneos (organizador/tienda)
- [ ] Componentes dominio: TournamentCard, PodTable, RoundView

## Fase 5 — Mapa y Dashboards

- [ ] `<MapaTiendas>` integrado en Landing
- [ ] Landing finalizado (componentizar HTML del landing.html)
- [ ] Dashboard jugador
- [ ] Dashboard organizador
- [ ] Dashboard tienda
- [ ] "Mis estadísticas" como sección del perfil del jugador
- [ ] Configuración de tienda (Módulo 1) terminada

## Fase 6 — Pulido final

- [ ] QA cruzado de todas las pantallas
- [ ] Responsive en breakpoints clave (375, 768, 1280, 1920)
- [ ] Lazy loading de imágenes de cartas
- [ ] Code splitting por módulo
- [ ] Empty states y error states completos
- [ ] Deploy a Vercel
- [ ] CORS de producción configurado en backend

---

## Pendientes transversales (sin fase fija)

- [ ] Endpoint del asistente IA (backend) — actualmente mockeado
- [ ] Endpoints de "mis inscripciones" y "mis torneos" — confirmar si existen
- [ ] Sistema de pairings de Commander — definir lógica
- [ ] Sistema de puntaje por mesa — definir reglas
- [ ] Embeddings de cartas con OpenAI (backend) — pendiente OPENAI_API_KEY
- [ ] Logo gráfico definitivo
- [ ] Notificaciones in-app

---

## Convenciones del repo

- **Commits**: Conventional Commits (`feat`, `fix`, `chore`, etc. + scope opcional).
- **Branches**:
  - `main` — estado estable / producción.
  - `dev` — rama de integración. Las features mergean acá vía PR.
  - `feature/<descripcion-fase>` — ramas de trabajo, una por fase. Ambas personas trabajan sobre la misma rama de la fase, secuencialmente. Parten de `dev` y vuelven a `dev` con un único PR al cerrar la fase.
- **PRs**: review del compañero antes de mergear `feature/...` a `dev`. `dev` se mergea a `main` cuando hay un release listo.
- **Estilo de código**: ESLint + Prettier (corren con `npm run lint` y `npm run format`).
- **Specs**: `DECKORA_FRONTEND.md` es la fuente de verdad de diseño y módulos.
