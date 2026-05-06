# Deckora — Project TODO

Estado vivo del proyecto frontend. Cada item se marca `[x]` cuando se completa.
Este documento es para que cualquier persona (humana o IA) que entre al proyecto sepa exactamente dónde estamos parados.

Última actualización: 2026-05-06

---

## Estado general

- [x] **Fase 1 — Fundamentos** (Sprint 0)
- [x] **Fase 2 — Identidad** (auth + perfiles)
- [x] **Fase 3 — Mazos y Colecciones**
- [x] **Fase 4 — Torneos**
- [x] **Fase 5 — Mapa y Dashboards**
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
- [x] Modo edición (deck builder) + activar botón "Editar"
- [x] Asistente IA mockeado, pulido responsive y empty/error states

## Fase 4 — Torneos

- [x] Cartelera (`/torneos`)
- [x] Detalle torneo + inscripción
- [x] Crear / editar torneo (FormularioTorneo con mini-mapa Leaflet)
- [x] Gestión torneo en vivo (GestionTorneo base, crear rondas)
- [x] Tabs en perfiles: Mis inscripciones (jugador), Mis torneos (organizador/tienda)
- [x] Componentes dominio: TournamentCard, EstadoBadge, PodTable, RoundView
- [x] ReportarResultadoModal, cambio de estados completo, pulido final

## Fase 5 — Mapa y Dashboards

### Persona A — Commits completados (rama: `feature/mapa-y-dashboards`)

- [x] **Commit A1** · `feat(mapa): agregar componente MapaTiendas con pines y geolocalización`
  - [x] `src/hooks/useGeolocation.js` — hook de geolocalización del navegador
  - [x] `src/services/tiendas.service.js` — extendido con listarTiendas, listarTiendasCercanas, obtenerTienda, listarTorneosDeTienda
  - [x] `src/components/domain/StorePin.jsx` — divIcon custom con SVG inline (gota crimson + borde gold)
  - [x] `src/components/domain/MapaTiendas.jsx` — mapa react-leaflet con tiles CartoDB Dark, zoom custom, botón geo
  - [x] `src/pages/DemoMapa.jsx` — demo dev en `/demo/mapa` (eliminar en Commit B3)
  - [x] CSS co-localizado en `src/styles/components/`
  - [x] `src/components/domain/index.js` actualizado

- [x] **Commit A2** · `feat(dashboards): componentizar landing en secciones reutilizables`
  - [x] `HeroLanding.jsx` — wordmark Cinzel Decorative, tagline, CTAs adaptados según auth/rol
  - [x] `FeaturesLanding.jsx` — grid de 4 features con íconos Lucide
  - [x] `ProfilesLanding.jsx` — 3 cards de roles con bullets y borde por rol
  - [x] `CTALanding.jsx` — CTA clip-path, oculto si autenticado
  - [x] `Landing.jsx` refactorizado como composición limpia
  - [x] TODO en Landing para Commit B3: `<SeccionMapaTiendas />`

- [x] **Commit A3** · `feat(identidad): agregar EstadisticasJugador con recharts y tab Mis estadísticas en perfil`
  - [x] `obtenerEstadisticasJugador` mockeado en `usuarios.service.js` (mock con historial, winRate, etc.)
  - [x] `EstadisticasJugador.jsx` mejorado: variante="completo"|"compacto", chart recharts, detalles mazo/comandante/torneos
  - [x] `MisEstadisticasTab.jsx` — tab wrapper visible solo para el dueño del perfil
  - [x] `PerfilJugador.jsx` actualizado con `MisEstadisticasTab` en tab "Mis estadísticas"
  - [x] `AppRoutes.jsx` corregido para usar `PerfilRouter` (fix de bug preexistente en dev)

### Persona B — Commits completados (rama: `feature/mapa-y-dashboards`)

- [x] **Commit B1** · `feat(dashboards): agregar dashboard del jugador con bloques de resumen`
  - `src/modules/dashboards/components/BloqueResumen.jsx` + `.css` — card reutilizable con header, CTA y cuerpo
  - `src/modules/dashboards/components/StatsRapidas.jsx` + `.css` — fila de stat cards genéricas
  - `src/services/torneos.service.js` — creado con `listarTorneos`, `listarTorneosProximos`, `listarMisTorneos`
  - `src/services/mazos.service.js` — extendido con `listarMazosRecientes` (client-side sort+slice)
  - `src/modules/dashboards/pages/DashboardJugador.jsx` + `.css` — dashboard completo con saludo, StatsRapidas, EstadisticasJugador compacto y 3 BloqueResumen

- [x] **Commit B2** · `feat(dashboards): agregar dashboards de organizador y tienda`
  - `src/modules/dashboards/pages/DashboardOrganizador.jsx` + `.css` — stats torneos + lista recientes + acciones rápidas
  - `src/modules/dashboards/pages/DashboardTienda.jsx` + `.css` — stats tienda + próximos eventos + acciones rápidas

- [x] **Commit B3** · `feat(mapa): integrar SeccionMapaTiendas en landing y eliminar demo`
  - `src/modules/mapa/components/SeccionMapaTiendas.jsx` + `.css` — wrapper con fetch, loading, error y footer con conteo
  - `Landing.jsx` — integrada `<SeccionMapaTiendas />` entre ProfilesLanding y CTALanding
  - `src/pages/DemoMapa.jsx` eliminado; ruta `/demo/mapa` removida de AppRoutes.jsx
  - Nota: `ConfiguracionTiendaTab.jsx` ya tenía mini-mapa con click handler implementado por Persona A — no requirió modificación

**Fase 5 completa. Rama lista para PR a `dev`.**

## Fase 6 — Pulido final

Rama de trabajo: `feature/pulido-final`

### Persona A — Commits completados

- [x] **Commit A0** (pre-trabajo) · `fix(services): agregar listarTorneosProximos y listarMisTorneos` _(incluido en Commit 1)_
  - Fix de build: `torneos.service.js` carecía de estos exports requeridos por Fase 5 B1

- [x] **Commit A1** · `feat(ui): agregar sistema de toasts y traducción de errores`
  - `src/utils/errors.js`: `traducirError()` (mapeo HTTP + Supabase → español neutro), `esColdStart()`
  - `src/components/ui/Toast.jsx` + `Toast.css`: toast con variantes exito/error/info/advertencia, aria-live, pause-on-hover, animaciones slide/fade
  - `src/context/ToastContext.jsx`: provider con máx 4 toasts, container fixed top-right (top-center mobile), hooks `mostrarExito/Error/Info/Advertencia`
  - `App.jsx`: monta `ToastProvider`
  - Integración toasts en: Login, Registro, RecuperarPassword, CuentaTab, ConfiguracionTiendaTab, CrearMazoModal, CrearTorneo, EditarTorneo, PanelInscripcion

- [x] **Commit A2** · `feat(ui): agregar ConfirmDialog destructivo y mensaje de cold start`
  - `src/components/ui/ConfirmDialog.jsx` + `ConfirmDialog.css`: modal de confirmación con variantes, requiereTexto, foco en Cancelar, aria
  - `src/hooks/useConfirmDialog.jsx`: hook con estado y async onConfirmar
  - `src/hooks/useApiCall.js`: hook para llamadas async con detección de cold start
  - `Spinner.jsx`: prop `mostrarColdStart` muestra mensaje "El servidor está despertando…"
  - `CuentaTab.jsx`: reemplaza modal manual por `useConfirmDialog` con `requiereTexto="ELIMINAR"`
  - `MisMazos.jsx`: timer 3s activa cold start en carga inicial

- [x] **Commit A3** · `feat(ui): agregar ErrorBoundary global, rediseño 404/403 y validación inline`
  - `src/components/ui/ErrorBoundary.jsx` + css: captura crashes de render, fallback temático, detalle en dev
  - `main.jsx`: monta ErrorBoundary sobre toda la app
  - `src/pages/NotFound.jsx` + css: SVG carta, "404 — Esta carta no está en el grimorio"
  - `src/pages/Forbidden.jsx` + css: SVG candado, "403 — No puedes cruzar este umbral"
  - `src/utils/validators.js`: funciones puras de validación
  - `src/hooks/useFormValidation.js`: hook con touched/errors, on-blur, validar() al submit
  - `Input.jsx`: aria-invalid + aria-describedby
  - `Login.jsx`: validación on-blur

### Persona B — Commits en progreso

- [x] **Commit B1** · `perf(ui): agregar lazy loading de imágenes y code splitting por módulo`
  - `MTGCard.jsx`: skeleton durante carga (`imgCargada` state), `decoding="async"`, prop `prioridad` ("auto"|"alta"), `loading="lazy"` condicional.
  - `MTGCard.css`: `.mtg-card__skeleton` con `aspect-ratio: 488/680` y animación shimmer.
  - `AppRoutes.jsx`: todas las páginas convertidas a `React.lazy()` + `<Suspense>` + `<ErrorBoundary fallback={<ErrorChunk />}>`. Landing queda eagerly loaded.
  - `ErrorBoundary.jsx`: extendido con prop `fallback` opcional.
  - `ErrorChunk.jsx` + `ErrorChunk.css`: creados — fallback de chunk con botón Reintentar.
  - `vite.config.js`: `rolldownOptions.output.codeSplitting: true` para Rolldown (Vite 8).
  - Bundle: index 1.2 MB → 380 kB. Chunks por módulo: Login ~2 kB, MisMazos ~3 kB, Cartelera ~3 kB, etc.
  - Nota: `EstadisticasJugador` chunk pesa 358 kB por recharts (dependencia pesada, esperado).

- [x] **Commit B2** · `feat(a11y): cumplir WCAG A y agregar tooltips en términos MTG`
  - `index.html`: `lang="es"` (corregido desde `lang="en"`). (WCAG 3.1.1)
  - `base.css`: `*:focus-visible` con outline dorado 2px. (WCAG 2.4.7)
  - `FormatBadge.jsx`: tooltip descriptivo por formato (Commander, Standard, Modern, Pioneer, Legacy). (H10.1)
  - `CommanderBadge.jsx`: tooltip explicativo del comandante. (H10.1)
  - `EstadisticasJugador.jsx`: tooltip en "Win Rate" con definición. (H10.1)
  - `ColeccionEditor.jsx`: tooltip en "Foil" explicando el término. (H10.1)
  - `Cartelera.jsx`: `aria-label` en inputs de búsqueda y fecha sin label visible. (WCAG 1.3.1)
  - `FormularioTorneo.jsx`: labels asociados vía htmlFor/id en datetime-local y coords lat/lng; `aria-required` y `role="alert"` en errores. (WCAG 1.3.1, 3.3.2)
  - `ReportarResultadoModal.jsx`: `aria-label` dinámico en input de puntos por jugador. (WCAG 1.3.1)
  - `AppLayout.jsx`: ya usa `<main>`, `<nav>` — estructura semántica correcta. (WCAG 1.3.1)
  - `Modal.jsx`: ya tiene `aria-label="Cerrar"` en botón close. Bootstrap maneja focus trap. (WCAG 2.1.1)
  - Deuda documentada: foco visible en Leaflet map (mapa), WCAG AA (ratio 4.5:1), tests automáticos de a11y.

- [ ] `chore(deploy)`: empty states completos en listas (mazos, colecciones, torneos, inscripciones), `vercel.json` con rewrites SPA, README con sección de deploy, build sin warnings de chunk size, limpiar console.logs e imports no usados, marcar PROJECT_TODO completo.

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
