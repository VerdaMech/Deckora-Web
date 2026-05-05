# Deckora — Project TODO

Estado vivo del proyecto frontend. Cada item se marca `[x]` cuando se completa.
Este documento es para que cualquier persona (humana o IA) que entre al proyecto sepa exactamente dónde estamos parados.

Última actualización: 2026-05-02

---

## Estado general

- [x] **Fase 1 — Fundamentos** (Sprint 0)
- [x] **Fase 2 — Identidad** (auth + perfiles)
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
- [x] **Commit 6** · `feat(layout): agregar navbar, sidebar, footer, app layout y skeleton de rutas`
  - [x] Navbar.jsx (logo, links, avatar+dropdown, hamburguesa+offcanvas mobile)
  - [x] Sidebar.jsx (items por rol, colapso a 64px, active por ruta)
  - [x] Footer.jsx
  - [x] AppLayout.jsx (Navbar + Sidebar condicional + Outlet + Footer)
  - [x] components/layout/index.js
  - [x] PlaceholderPage.jsx
  - [x] NotFound.jsx (estilo inmersivo)
  - [x] Forbidden.jsx (estilo inmersivo)
  - [x] Placeholders de todos los módulos (identidad, mazos, torneos, dashboards)
  - [x] routes.jsx por módulo
  - [x] AppRoutes.jsx (con sidebar vs sin sidebar)
  - [x] App.jsx limpio con AuthProvider + BrowserRouter + AppRoutes
  - [x] CSS dropdown y offcanvas en components.css

---

## Fase 2 — Identidad

Objetivo: que un usuario pueda registrarse, loguearse y ver su perfil.

### Persona A (sesión actual)

- [x] **Commit 1** · `feat(identidad): agregar página de login con integración al flujo de auth`
  - [x] src/services/auth.service.js (signup, login, logout, getMe, recuperarPassword)
  - [x] src/context/AuthContext.jsx refactorizado para delegar al service
  - [x] src/modules/identidad/pages/Login.jsx (form completo, validación, redirect por rol)
  - [x] CSS auth en src/styles/components.css (.auth-page, .auth-card, .auth-form, etc.)

- [x] **Commit 2** · `feat(identidad): agregar página de registro con selector de rol`
  - [x] src/modules/identidad/components/SelectorRol.jsx
  - [x] src/modules/identidad/pages/Registro.jsx

- [x] **Commit 3** · `feat(identidad): agregar página de recuperación de contraseña`
  - [x] src/modules/identidad/pages/RecuperarPassword.jsx

### Persona B (sesión actual)

- [x] **Commit 4** · `feat(identidad): agregar perfil de jugador con estadísticas`
  - [x] src/services/usuarios.service.js (obtenerPerfilPublico, obtenerEstadisticas, obtenerMisInscripciones, obtenerTorneosDeUsuario, actualizarMiPerfil)
  - [x] src/components/domain/RoleBadge.jsx
  - [x] src/components/domain/EstadisticasJugador.jsx (con Skeleton y EmptyState)
  - [x] src/modules/identidad/pages/PerfilJugador.jsx (avatar, stats, mazos mock, tabs si es dueño)
  - [x] src/modules/identidad/pages/PerfilRouter.jsx (despacha según perfil.rol)
  - [x] src/modules/identidad/routes.jsx actualizado a PerfilRouter
  - [x] CSS en components.css (.profile-*, .estadisticas-jugador*)
- [x] **Commit 5** · `feat(identidad): agregar perfiles de organizador y tienda`
  - [x] src/components/domain/MiniMapaTienda.jsx (react-leaflet, tiles dark, pin custom)
  - [x] src/modules/identidad/pages/PerfilOrganizador.jsx
  - [x] src/modules/identidad/pages/PerfilTienda.jsx (info + mini-mapa + torneos)
  - [x] PerfilRouter.jsx actualizado con organizador y tienda
  - [x] leaflet CSS importado en main.jsx
- [x] **Commit 6** · `feat(identidad): agregar configuración de cuenta con tabs cuenta y tienda`
  - [x] src/services/tiendas.service.js
  - [x] src/modules/identidad/components/CuentaTab.jsx (cambio email/pass + eliminar cuenta con modal)
  - [x] src/modules/identidad/components/ConfiguracionTiendaTab.jsx (mapa interactivo + coords)
  - [x] src/modules/identidad/pages/Configuracion.jsx (tabs por rol, soporte ?tab=tienda)

## Fase 3 — Mazos y Colecciones

### Persona A — Commit 1 (Servicios y primitivos de dominio MTG)

- [x] **Servicios de dominio**
  - [x] src/services/cartas.service.js (buscarCartas, obtenerCarta, listarCartas)
  - [x] src/services/colecciones.service.js (obtenerMiColeccion, agregarCarta, actualizarCarta, eliminarCarta)
  - [x] src/services/mazos.service.js (listarMisMazos, crearMazo, obtenerMazo, cartas CRUD, validarMazo)
- [x] **Utilidades e infraestructura**
  - [x] src/utils/deck-helpers.js (agruparPorTipo, calcularCurva, calcularDistribucionColor, parseManaCost, contarCartasMazo)
  - [x] src/utils/formatters.js (relativeDate, formatDate, formatNumber)
  - [x] src/hooks/useDebounce.js
  - [x] Fuente Mana (Andrew Gioia) agregada via CDN en index.html
- [x] **Componentes primitivos MTG** (src/components/domain/, cada uno con CSS co-localizado)
  - [x] ManaCost.jsx
  - [x] MTGCard.jsx (variantes: thumbnail, inline, full)
  - [x] FormatBadge.jsx
  - [x] CommanderBadge.jsx
  - [x] DeckList.jsx (editable=false por defecto; prop y handlers listos para Persona B)
  - [x] src/components/domain/index.js creado

### Persona A — Commit 2 (Módulo de colecciones)

- [x] **Páginas**
  - [x] MisColecciones.jsx + .css (ruta /colecciones)
  - [x] DetalleColeccion.jsx + .css (ruta /colecciones/:id)
- [x] **Componentes del módulo**
  - [x] BarraAgregarCarta.jsx + .css (búsqueda con debounce, dropdown, cierra con Escape/click fuera)
  - [x] ColeccionEditor.jsx + .css (cantidad stepper, toggle foil, eliminar con confirmación)
- [x] Rutas /colecciones y /colecciones/:id reales (ya estaban correctas en routes.jsx)

### Persona A — Commit 3 (Mazos modo lectura)

- [x] **Páginas**
  - [x] MisMazos.jsx + .css (ruta /mazos, grid responsive, botón Crear abre modal)
  - [x] CrearMazoModal.jsx + .css (form con nombre, formato, descripción, público; validación cliente)
  - [x] DetalleMazo.jsx + .css (ruta /mazos/:id, DeckList modo lectura, placeholder stats, botón Editar deshabilitado con Tooltip)
- [x] Rutas /mazos y /mazos/:id reales; ruta /mazos/nuevo eliminada (modal vive en /mazos)

**Nota:** Modo edición y DeckStats pendientes para Persona B (commits 4-5).

### Persona B — Commits 4–6

- [x] DeckStats.jsx + reemplazar placeholder en DetalleMazo
- [ ] Modo edición (deck builder) + activar botón "Editar"
- [ ] Asistente IA mockeado, pulido responsive y empty/error states

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
