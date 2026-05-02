# Deckora — Especificación Frontend

Documento maestro del frontend de Deckora. Reemplaza al `DESIGN_SYSTEM.md` previo: incluye toda la información de diseño visual **más** la definición de módulos del proyecto y los requisitos específicos de cada pantalla. Es la fuente de verdad para todo el desarrollo de UI.

---

## 1. Contexto

Deckora es una plataforma web para la comunidad de **Magic: The Gathering**, con foco inicial en formato **Commander**. Centraliza:

- Gestión de colecciones de cartas y mazos.
- Asistente IA embebido para recomendaciones de mazo.
- Organización y gestión de torneos.
- Visibilidad de tiendas locales mediante mapa.
- Estadísticas e historial de desempeño del jugador.

Los usuarios pueden registrarse con uno de tres roles: **jugador**, **organizador** o **tienda**. El rol se elige al momento del registro y queda asociado al usuario en la base de datos.

---

## 2. Stack técnico

- **Framework**: React 18 + Vite (JavaScript).
- **UI base**: `react-bootstrap` (grid, modales, dropdowns, offcanvas, forms básicos). Se sobre-escribe el estilo con CSS propio.
- **Routing**: `react-router-dom` v6.
- **Estado global**: Context API (no Redux).
- **Auth**: Supabase Auth (`@supabase/supabase-js`). El access token se manda como `Authorization: Bearer <token>` al backend Express.
- **HTTP client**: helper sobre `fetch` que adjunta el JWT.
- **Mapas**: `react-leaflet` + tiles de **CartoDB Dark Matter** (gratis, sin API key, encaja con el theme dark).
- **Iconos**: `lucide-react` (estilo line, stroke fino).
- **Charts**: `recharts`.
- **Símbolos de maná**: font Mana de Andrew Gioia (https://mana.andrewgioia.com/).
- **Tipografía web**: Google Fonts — Cinzel Decorative, Cinzel, Crimson Pro.
- **Despliegue**: Vercel (frontend), Render (backend).
- **Convención de commits**: Conventional Commits.

### Backend disponible

- **API URL (Render)**: `https://deckora-api.onrender.com/`
- **Auth**: JWT de Supabase directo. El frontend hace login con `supabase.auth.signInWithPassword`, recibe el access token, y lo manda al backend.
- **Cold start**: el plan free de Render duerme la app después de 15 min sin tráfico. La primera request del día puede tardar 30-60 segundos.

### Variables de entorno (frontend)

```
VITE_SUPABASE_URL=https://vpkugzmyjeakmzkbxbla.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key pública de Supabase>
VITE_API_URL=https://deckora-api.onrender.com
```

---

## 3. Filosofía visual — "Salón vs. Cámara de batalla"

El landing page (`deckora_landing.html`) define la identidad visual: dark mode épico con paleta dorado/carmesí sobre negro, tipografía serif (Cinzel + Crimson Pro), grain overlay, gradientes radiales, clip-paths en CTAs. Estilo "tavern/arcana medieval".

Adoptamos un enfoque **mixto** para no sacrificar usabilidad:

- **Pantallas inmersivas (estilo épico full)**: Landing, Login/Registro, Cartelera de Torneos, Detalle de Torneo, Perfiles públicos, Mapa de Tiendas.
  Mantienen grain, gradientes radiales, clip-paths en CTAs principales, Cinzel en títulos, brillos dorados.

- **Pantallas operativas (estilo limpio)**: Dashboards, Mis Mazos, Detalle de Mazo (modo edición), Detalle de Colección, Configuración, Gestión de Torneo en vivo.
  Mismas variables de color y mismas fuentes, pero menos efectos, más espacio negativo, bordes más sutiles, énfasis en legibilidad.

**Regla mental**: si el usuario va a quedarse 30+ segundos escaneando información en la pantalla, es operativa. Si es de paso o aspiracional, es inmersiva.

---

## 4. Tokens de diseño

Variables CSS definidas en `src/styles/tokens.css` y consumidas en toda la app. Nunca usar valores hardcodeados.

### 4.1 Colores

```css
:root {
  /* === Brand === */
  --gold:           #c9a84c;
  --gold-light:     #e8c96a;
  --gold-dim:       #7a5e25;
  --crimson:        #8b1a1a;
  --crimson-bright: #c0392b;

  /* === Backgrounds === */
  --bg-app:         #0a0608;  /* fondo de la app */
  --bg-elevated:    #100c10;  /* navbar, sidebar */
  --bg-panel:       #160e16;  /* cards, paneles */
  --bg-panel-2:     #1e1420;  /* hover, modales, elevación extra */
  --bg-overlay:     rgba(10, 6, 8, 0.85);

  /* === Bordes === */
  --border-subtle:  rgba(201, 168, 76, 0.12);
  --border-default: rgba(201, 168, 76, 0.25);
  --border-strong:  rgba(201, 168, 76, 0.55);

  /* === Texto === */
  --text-primary:   #f0e8d8;
  --text-default:   #d4c5b0;
  --text-muted:     #7a6a58;
  --text-on-gold:   #0a0608;

  /* === Estado / semántico === */
  --success:        #4a8c5e;
  --success-bg:     rgba(74, 140, 94, 0.12);
  --warning:        #c98c2c;
  --warning-bg:     rgba(201, 140, 44, 0.12);
  --danger:         #c0392b;
  --danger-bg:      rgba(192, 57, 43, 0.12);
  --info:           #5a7fa0;
  --info-bg:        rgba(90, 127, 160, 0.12);

  /* === Roles === */
  --role-jugador:    var(--gold);
  --role-organizador:#a06fc4;
  --role-tienda:     #c08a4a;

  /* === MTG colores de maná === */
  --mana-w: #f8f6d8;
  --mana-u: #aae0fa;
  --mana-b: #2c2622;
  --mana-r: #f9aa8f;
  --mana-g: #9bd3ae;
  --mana-c: #ccc2c0;
}
```

### 4.2 Espaciado, radii, sombras, z-index

```css
:root {
  /* Espaciado (múltiplos de 4px) */
  --space-1: 0.25rem;  --space-2: 0.5rem;
  --space-3: 0.75rem;  --space-4: 1rem;
  --space-5: 1.5rem;   --space-6: 2rem;
  --space-7: 3rem;     --space-8: 4rem;

  /* Radii */
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   8px;
  --radius-pill: 999px;

  /* Sombras y brillos */
  --shadow-sm:  0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md:  0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-lg:  0 20px 60px rgba(0, 0, 0, 0.7);
  --glow-gold:  0 0 18px rgba(201, 168, 76, 0.25);
  --glow-gold-strong: 0 0 28px rgba(201, 168, 76, 0.5);
  --glow-crimson: 0 0 20px rgba(139, 26, 26, 0.4);

  /* Z-index */
  --z-base: 1;       --z-sticky: 50;
  --z-navbar: 100;   --z-sidebar: 90;
  --z-dropdown: 200; --z-modal: 1000;
  --z-toast: 1100;   --z-tooltip: 1200;
}
```

---

## 5. Tipografía

### 5.1 Fuentes

- **`'Cinzel Decorative', serif`** — display, hero, logo wordmark. Solo en piezas grandes y aisladas.
- **`'Cinzel', serif`** — labels en mayúscula, navegación, badges, botones, títulos.
- **`'Crimson Pro', Georgia, serif`** — body, descripciones, formularios, contenido largo.

### 5.2 Escala

| Token | Tamaño | Fuente | Peso | Uso |
|---|---|---|---|---|
| `--font-display` | 4rem | Cinzel Decorative | 900 | Hero del landing, wordmark |
| `--font-h1` | 2.5rem | Cinzel | 700 | Título de página inmersiva |
| `--font-h2` | 2rem | Cinzel | 700 | Sección |
| `--font-h3` | 1.5rem | Cinzel | 600 | Subsección |
| `--font-h4` | 1.25rem | Cinzel | 600 | Card title, modal title |
| `--font-h5` | 1rem | Cinzel | 600 | Label de bloque |
| `--font-body` | 1rem | Crimson Pro | 400 | Texto general |
| `--font-body-lg` | 1.125rem | Crimson Pro | 400 | Lead, intros |
| `--font-small` | 0.875rem | Crimson Pro | 400 | Texto secundario |
| `--font-micro` | 0.75rem | Cinzel | 600 | Labels uppercase, badges |
| `--font-mono` | 0.875rem | ui-monospace | — | IDs, slugs |

Letter-spacing en Cinzel uppercase: `0.12em` para botones, `0.15em` para labels micro, `0.08em` para títulos.

### 5.3 Reglas

- Cinzel Decorative **solo** en logo y hero. Nunca en botones ni labels.
- Cinzel uppercase para todo lo "ceremonial": botones, navegación, badges, títulos.
- Crimson Pro para todo el contenido leíble.
- No mezclar pesos light (300) y bold (700) en el mismo bloque sin razón.

---

## 6. Layout

### 6.1 Navbar

- Fija arriba, **64px de alto**.
- En pantallas inmersivas: gradiente vertical `var(--bg-elevated)` → transparente.
- En pantallas operativas: fondo sólido `var(--bg-elevated)` con border-bottom subtle.
- Logo a la izquierda (Cinzel Decorative dorado, placeholder).
- Links centro/derecha en Cinzel uppercase 0.72rem.
- Acciones derecha:
  - Sin auth: botón ghost (login) + primary (registro).
  - Con auth: avatar + dropdown con perfil, configuración, logout.
- En mobile (<lg): menú hamburguesa que abre offcanvas con los links.

### 6.2 Sidebar

Aplica **solo** en estas rutas:

- `/jugador` (dashboard del jugador)
- `/organizador` (dashboard del organizador)
- `/tienda` (dashboard de la tienda)
- `/configuracion` (configuración de cuenta)
- Pantallas de gestión de torneo

NO aplica en: Landing, Login, Registro, Mis Mazos, Detalle de Mazo, Mis Colecciones, Detalle de Colección, Cartelera, Detalle de Torneo, Perfiles públicos.

Especificación:

- Ancho: 240px en desktop, colapsable a 64px (solo iconos).
- Posición: fija debajo de la navbar (`top: 64px; bottom: 0`).
- Fondo: `var(--bg-elevated)` con border-right subtle.
- Items: ícono lucide 18px + label Cinzel 0.75rem uppercase.
  - Hover: bg `rgba(201,168,76,0.05)`.
  - Active: border-left 2px gold, bg `rgba(201,168,76,0.08)`.
- En mobile (<md): se vuelve offcanvas con botón hamburguesa adicional.

Items por rol:

| Rol | Sidebar items |
|---|---|
| Jugador | Dashboard, Mi colección, Mis mazos, Mi perfil, Configuración |
| Organizador | Dashboard, Mis torneos, Crear torneo, Mi perfil, Configuración |
| Tienda | Dashboard, Mis torneos, Crear torneo, Mi perfil, Configuración (incluye Configuración de tienda) |

### 6.3 Contenido

- Ancho máximo: 1200px (operativas), 1400px (inmersivas).
- Padding lateral: `var(--space-6)` desktop, `var(--space-4)` mobile.
- Padding superior: `var(--space-7)` desktop después de la navbar.

### 6.4 Footer

Minimal. Links: Acerca de, Contacto, redes sociales. Aparece en todas las pantallas.

---

## 7. Responsive design

**Mobile-first** salvo en deck builder y gestión de torneo en vivo, que se diseñan desktop-first y degradan en mobile.

### 7.1 Breakpoints (Bootstrap 5 sin modificar)

- `sm`: 576px
- `md`: 768px
- `lg`: 992px
- `xl`: 1200px
- `xxl`: 1400px

### 7.2 Reglas de adaptación

- **Navbar**: hamburguesa en `<lg`.
- **Sidebar**: offcanvas en `<md`.
- **Tablas**: se transforman en cards apiladas en `<md`.
- **Forms**: inputs full-width en mobile, grid de 2 columnas en desktop.
- **Mapa de tiendas**: en mobile, lista arriba y mapa abajo (no side-by-side).
- **Detalle de mazo (modo edición)**: en mobile, solo la lista del mazo + buscador en modal + panel de stats accesible desde tab. Sin las 3 columnas.
- **Cards de torneos**: grid de 3-4 columnas en desktop, 2 en tablet, 1 en mobile.
- **Imágenes de cartas**: usar `srcset` con `small` (146×204) en mobile y `normal` (488×680) en desktop. Ahorra ancho de banda.
- **Touch targets**: mínimo 44×44px en mobile (botones, links, controles interactivos).

### 7.3 Probar en

- 375px (iPhone SE)
- 768px (iPad)
- 1280px (laptop)
- 1920px (desktop full HD)

---

## 8. Componentes core (UI base)

### 8.1 Button

Variantes: `primary` (gold gradient), `primary-clip` (gradient + clip-path, solo landing y CTAs muy destacados), `ghost` (transparente con border gold), `secondary` (bg panel + border subtle), `danger` (bg crimson).

Tamaños: `sm`, `md`, `lg`. Texto siempre Cinzel uppercase 0.12em letter-spacing. Soporta icono lucide a la izquierda. Estados: hover (más brillo + glow), active (translateY 1px), disabled (opacity 0.4), loading (spinner reemplaza icono).

### 8.2 Inputs y forms

- Background `var(--bg-panel)`, border `var(--border-subtle)`.
- Focus: `var(--border-strong)` + glow gold suave.
- Label arriba en Cinzel uppercase 0.7rem.
- Helper text debajo en Crimson Pro 0.8rem `var(--text-muted)`.
- Error: border `var(--danger)`, helper en `var(--danger)`.
- Required mark: `*` dorado.

### 8.3 Cards

- `card-default` — bg-panel, border subtle, padding 24px, radius lg.
- `card-elevated` — bg-panel-2, shadow-md.
- `card-interactive` — default + hover translateY + border-default + shadow.
- `card-feature` — accent gold superior (border-top 2px).

### 8.4 Modales

- Backdrop `var(--bg-overlay)` con `backdrop-filter: blur(8px)`.
- Content bg-panel, border default, radius lg, shadow-lg.
- Título Cinzel uppercase. Botón cerrar con icono X.

### 8.5 Tablas

- Sin filas alternadas (queda muy ruidoso en dark).
- Header bg-panel-2, Cinzel uppercase 0.75rem.
- Body Crimson Pro 0.95rem. Hover: bg-panel-2.
- Bordes solo en filas (border-bottom subtle).
- En `<md`: convertir a cards apiladas.

### 8.6 Badges

| Tipo | Estilo |
|---|---|
| `format` | Border-only dorado |
| `estado` | Sólido (pendiente→warning, en_curso→info, finalizado→success, cancelado→muted) |
| `rol` | Sólido con `--role-*` |
| `resultado` | Sólido (ganador→success, perdedor→muted, empate→warning, pendiente→muted outline) |

Todos: padding 0.25rem 0.6rem, radius sm, Cinzel uppercase 0.7rem.

### 8.7 Otros

- **Alerts inline**: bg `--{semantic}-bg`, border-left 3px del color sólido.
- **Toasts**: top-right, fade in/out, auto-dismiss 5s. `react-hot-toast` o `react-bootstrap` Toast.
- **Tabs**: estilo underline, tab activa con border-bottom 2px gold.
- **Empty states**: icono lucide 48px muted + título Cinzel + descripción Crimson Pro + CTA opcional.
- **Spinners**: SVG custom con círculo dorado rotando.
- **Skeletons**: bg-panel-2 con animación shimmer.
- **Tooltips**: bg-panel-2, border subtle, text default.

---

## 9. Componentes de dominio

Específicos de Deckora. Viven en `src/components/domain/`.

### 9.1 `<MTGCard variant size>`

Visualización de carta. Variantes: `thumbnail` (100×140, hover muestra preview), `inline` (60×84 + nombre + costo), `full` (240×336 + detalles). Borde dorado sutil. Si la carta es comandante en contexto, badge "CMDR".

### 9.2 `<ManaCost cost>`

Renderiza el costo de maná usando font Mana. Acepta strings tipo `"{2}{W}{U}"`.

### 9.3 `<DeckList deck>`

Lista de cartas agrupada por tipo (Creatures, Lands, Instants, Sorceries, Artifacts, Enchantments, Planeswalkers, Other). Header del grupo en Cinzel uppercase con conteo. Comandante separado al tope con badge.

### 9.4 `<DeckStats deck>`

Curva de maná (BarChart), distribución de identidad de color (PieChart con `--mana-*`), tipos (DonutChart). Total cartas / requeridas según formato. Estado de validación.

### 9.5 `<DeckBuilder mazo>`

Modo edición integrado en Detalle de Mazo. Layout de 3 columnas en desktop:

- Izquierda: buscador de cartas (consume `/cartas/buscar`).
- Centro: `<DeckList>` editable.
- Derecha: `<DeckStats>` + asistente IA (botón "Pedir recomendaciones").

En tiempo real llama a `POST /mazos/:id/validar` después de cada cambio.

### 9.6 `<ColeccionEditor coleccion>`

Patrón análogo al deck builder pero más simple: lista de cartas + buscador integrado para agregar.

### 9.7 `<TournamentCard torneo>`

Card resumen para listados. Imagen placeholder con gradient overlay. Nombre, fecha, ubicación, FormatBadge, EstadoBadge, cupo "X/Y". Hover: glow gold.

### 9.8 `<PodTable enfrentamiento>`

Mesa de Commander de 4 jugadores. Header "Mesa N" + EstadoBadge. Filas: avatar + nombre + mazo + comandante + resultado + puntos. Botón "Reportar resultado" si organizador o jugador en la mesa.

### 9.9 `<RoundView ronda>`

Vista de una ronda completa: lista de pods con sus enfrentamientos.

### 9.10 `<MapaTiendas tiendas center zoom>`

Wrapper de `react-leaflet` con tiles `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`. Pins son `<StorePin>`. Soporta filtro por proximidad.

### 9.11 `<StorePin tienda>`

`divIcon` de Leaflet con HTML custom: ícono lucide MapPin dorado sobre fondo crimson en forma de gota. Click abre popup con nombre + dirección + link al perfil público de la tienda.

### 9.12 `<FormatBadge>`, `<RoleBadge>`, `<EstadoBadge>`, `<CommanderBadge>`

Wrappers tematizados de Badge para los enums respectivos.

### 9.13 `<EstadisticasJugador usuarioId>`

Bloque reutilizable con stats del jugador: partidas ganadas/perdidas/empatadas, win rate, torneos participados. Usado tanto en perfil como en dashboard.

---

## 10. Iconografía

`lucide-react`. Stroke width 1.75 por defecto. Tamaños: 16px (inline), 18px (botones, sidebar), 20px (navbar), 24px (cards), 32-48px (empty states).

| Concepto | Icono |
|---|---|
| Mazo | `Layers` |
| Comandante | `Crown` |
| Torneo | `Swords` |
| Tienda | `Store` |
| Mapa / Ubicación | `MapPin` |
| Estadísticas | `BarChart3` |
| Configuración | `Settings` |
| Perfil | `User` |
| Notificaciones | `Bell` |
| Buscar | `Search` |
| Filtrar | `SlidersHorizontal` |
| Editar | `Pencil` |
| Eliminar | `Trash2` |
| Agregar | `Plus` |
| Confirmar | `Check` |
| Cancelar | `X` |
| Carpeta (colección) | `FolderClosed` |
| IA / Asistente | `Sparkles` |
| Calendar | `Calendar` |
| Reloj | `Clock` |
| Trofeo | `Trophy` |
| Logout | `LogOut` |
| Login | `LogIn` |

---

## 11. Mapa (Leaflet)

- Tiles: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- Atribución (obligatoria): `© OpenStreetMap contributors © CARTO`
- Min zoom: 4. Max zoom: 18.
- Controles default ocultos. Custom: zoom in/out con estilo dorado.
- Pins: `<StorePin>` con `divIcon`.

---

## 12. Reglas de uso

**DO**
- Usar variables CSS para todo. Nunca colores o tamaños hardcodeados.
- Cinzel uppercase para lo "ceremonial", Crimson Pro para todo lo leíble.
- Mantener buena densidad: respirar el contenido.
- Usar componentes de dominio en lugar de duplicar JSX.
- Probar contraste con WCAG AA mínimo.

**DON'T**
- No usar Bootstrap themes ni colores default sin override.
- No mezclar más de 2 tipografías en una pantalla.
- No usar dorado puro como fondo de área grande.
- No usar emojis para UI funcional. Lucide siempre.
- No abusar del clip-path. Reservarlo para landing y CTAs muy destacados.
- No usar shadows blancas. En dark mode las sombras son más oscuras que el fondo.
- No usar borders de 2px+ por defecto. Solo en estados activos.

---

## 13. Estructura de archivos

Organización híbrida: componentes UI/dominio y servicios compartidos viven en la raíz de `src/`. Cada módulo es una carpeta autocontenida con sus pages, componentes específicos y rutas.

### 13.1 Árbol completo

```
deckora-web/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   ├── fonts/                  (si decidimos hostear fonts en lugar de Google CDN)
│   │   └── images/
│   │       ├── logo-placeholder.svg
│   │       └── card-back.png       (placeholder para cartas sin imagen)
│   │
│   ├── components/                  ─── compartidos entre todos los módulos
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx       (shell: Navbar + Sidebar opcional + Outlet + Footer)
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── index.js
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   └── index.js            (re-export central: import { Button, Card } from '@/components/ui')
│   │   └── domain/
│   │       ├── MTGCard.jsx
│   │       ├── ManaCost.jsx
│   │       ├── DeckList.jsx
│   │       ├── DeckStats.jsx
│   │       ├── DeckBuilder.jsx
│   │       ├── ColeccionEditor.jsx
│   │       ├── TournamentCard.jsx
│   │       ├── PodTable.jsx
│   │       ├── RoundView.jsx
│   │       ├── MapaTiendas.jsx
│   │       ├── StorePin.jsx
│   │       ├── FormatBadge.jsx
│   │       ├── RoleBadge.jsx
│   │       ├── EstadoBadge.jsx
│   │       ├── CommanderBadge.jsx
│   │       ├── EstadisticasJugador.jsx
│   │       └── index.js
│   │
│   ├── modules/                     ─── cada módulo es autocontenido
│   │   ├── identidad/
│   │   │   ├── pages/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Registro.jsx
│   │   │   │   ├── RecuperarPassword.jsx
│   │   │   │   ├── PerfilJugador.jsx
│   │   │   │   ├── PerfilOrganizador.jsx
│   │   │   │   ├── PerfilTienda.jsx
│   │   │   │   └── Configuracion.jsx
│   │   │   ├── components/         (solo lo que se usa dentro del módulo)
│   │   │   │   ├── SelectorRol.jsx
│   │   │   │   ├── ConfiguracionTiendaTab.jsx
│   │   │   │   ├── MisInscripcionesTab.jsx
│   │   │   │   ├── MisTorneosTab.jsx
│   │   │   │   └── MisEstadisticasTab.jsx
│   │   │   └── routes.jsx          (definición de rutas del módulo)
│   │   │
│   │   ├── mazos/
│   │   │   ├── pages/
│   │   │   │   ├── MisColecciones.jsx
│   │   │   │   ├── DetalleColeccion.jsx
│   │   │   │   ├── MisMazos.jsx
│   │   │   │   ├── CrearMazoModal.jsx
│   │   │   │   └── DetalleMazo.jsx
│   │   │   ├── components/
│   │   │   │   ├── BarraAgregarCarta.jsx
│   │   │   │   ├── ModoEdicionMazo.jsx
│   │   │   │   ├── AsistenteIA.jsx
│   │   │   │   └── PanelValidacion.jsx
│   │   │   └── routes.jsx
│   │   │
│   │   ├── torneos/
│   │   │   ├── pages/
│   │   │   │   ├── Cartelera.jsx
│   │   │   │   ├── DetalleTorneo.jsx
│   │   │   │   ├── CrearTorneo.jsx
│   │   │   │   ├── EditarTorneo.jsx
│   │   │   │   └── GestionTorneo.jsx
│   │   │   ├── components/
│   │   │   │   ├── FormularioTorneo.jsx
│   │   │   │   ├── PanelInscripcion.jsx
│   │   │   │   ├── ListaInscritos.jsx
│   │   │   │   └── ReportarResultadoModal.jsx
│   │   │   └── routes.jsx
│   │   │
│   │   ├── mapa/
│   │   │   ├── components/
│   │   │   │   └── SeccionMapaTiendas.jsx   (se monta en Landing)
│   │   │   └── index.js
│   │   │
│   │   └── dashboards/
│   │       ├── pages/
│   │       │   ├── Landing.jsx
│   │       │   ├── DashboardJugador.jsx
│   │       │   ├── DashboardOrganizador.jsx
│   │       │   └── DashboardTienda.jsx
│   │       ├── components/
│   │       │   ├── HeroLanding.jsx
│   │       │   ├── FeaturesLanding.jsx
│   │       │   ├── ProfilesLanding.jsx
│   │       │   ├── CTALanding.jsx
│   │       │   ├── BloqueResumen.jsx
│   │       │   └── StatsRapidas.jsx
│   │       └── routes.jsx
│   │
│   ├── pages/                       ─── pages globales fuera de módulos
│   │   ├── NotFound.jsx
│   │   └── Forbidden.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js               (consume AuthContext)
│   │   ├── useApi.js                (helper para llamadas con loading/error)
│   │   ├── useGeolocation.js        (para mapa de tiendas)
│   │   ├── useDebounce.js           (para búsqueda de cartas)
│   │   └── useMediaQuery.js         (responsive)
│   │
│   ├── context/
│   │   └── AuthContext.jsx          (provider + hook)
│   │
│   ├── services/
│   │   ├── supabase.js              (cliente Supabase)
│   │   ├── api.js                   (fetch wrapper con JWT)
│   │   ├── auth.service.js
│   │   ├── cartas.service.js
│   │   ├── colecciones.service.js
│   │   ├── mazos.service.js
│   │   ├── torneos.service.js
│   │   ├── rondas.service.js
│   │   ├── enfrentamientos.service.js
│   │   ├── tiendas.service.js
│   │   └── usuarios.service.js
│   │
│   ├── styles/
│   │   ├── tokens.css               (variables :root)
│   │   ├── base.css                 (reset, body, grain overlay)
│   │   ├── typography.css
│   │   ├── components.css           (overrides de Bootstrap, clases utility)
│   │   └── index.css                (entry point que importa los anteriores)
│   │
│   ├── utils/
│   │   ├── constants.js             (enums tipados)
│   │   ├── formatters.js            (fechas, números, mana cost)
│   │   ├── validators.js            (formularios)
│   │   └── deck-helpers.js          (agrupar por tipo, calcular curva, etc.)
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx            (composición top-level de routes de cada módulo)
│   │   └── ProtectedRoute.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

### 13.2 Convenciones de naming

- **Componentes React**: `PascalCase.jsx` (`MTGCard.jsx`, `DeckBuilder.jsx`).
- **Hooks**: `camelCase.js` con prefijo `use` (`useAuth.js`, `useDebounce.js`).
- **Services**: `kebab-case.service.js` (`mazos.service.js`, `enfrentamientos.service.js`).
- **Utilities**: `kebab-case.js` (`deck-helpers.js`, `formatters.js`).
- **Carpetas**: minúsculas en singular (`module/identidad/`, `components/ui/`).
- **CSS**: `kebab-case.css`.
- **Rutas en URL**: minúsculas, plural cuando aplica (`/mazos`, `/torneos`, `/colecciones/:id`).

### 13.3 Re-exports con `index.js`

Cada carpeta de componentes (UI, dominio, layout) tiene un `index.js` que re-exporta todo. Permite imports limpios:

```js
// En lugar de:
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

// Se hace:
import { Button, Card, Modal } from '@/components/ui';
```

### 13.4 Aliases de imports (Vite)

Configurar en `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/modules': path.resolve(__dirname, './src/modules'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
});
```

Y en `jsconfig.json` (raíz) para que los editores resuelvan el autocompletado:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

### 13.5 Reglas para decidir dónde va un archivo

| Pregunta | Carpeta |
|---|---|
| ¿Lo usan 2+ módulos? | `src/components/{ui,domain}` o `src/hooks` o `src/utils` |
| ¿Es de un solo módulo? | `src/modules/<modulo>/components` o `src/modules/<modulo>/pages` |
| ¿Es estilo global? | `src/styles/` |
| ¿Mapea a una tabla del backend? | `src/services/` |
| ¿Es una constante derivada de los enums de la BD? | `src/utils/constants.js` |
| ¿Es una página (ruta en URL)? | `src/modules/<modulo>/pages` o `src/pages` (si es global) |
| ¿Es una pieza visual sin lógica de dominio? | `src/components/ui` |
| ¿Es una pieza visual con lógica de Magic/torneos? | `src/components/domain` |

Si hay duda, empieza en el módulo. Si después un segundo módulo lo necesita, se promueve a la raíz (`src/components/...`).

### 13.6 Orden de imports dentro de un archivo

Por convención (que ESLint puede enforzar con `eslint-plugin-import`):

1. Librerías externas (`react`, `react-bootstrap`, `lucide-react`, etc.).
2. Línea en blanco.
3. Imports con alias `@/` (componentes, servicios, hooks).
4. Línea en blanco.
5. Imports relativos (`./Component`, `../utils`).
6. Línea en blanco.
7. Imports de estilos (`./Component.css`).

Ejemplo:

```js
import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Sparkles } from 'lucide-react';

import { Button, Card, Spinner } from '@/components/ui';
import { DeckList, DeckStats } from '@/components/domain';
import { useAuth } from '@/hooks/useAuth';
import { obtenerMazo } from '@/services/mazos.service';

import { BarraAgregarCarta } from './BarraAgregarCarta';

import './DetalleMazo.css';
```

### 13.7 Co-localización de estilos

Para componentes con CSS específico (poco común porque la mayoría usa solo variables y clases utility), se permite un `.css` al lado del `.jsx`:

```
components/domain/
├── MTGCard.jsx
└── MTGCard.css      (estilos del hover preview, animaciones)
```

Para todo lo demás, las clases viven en `src/styles/components.css`.

### 13.8 Composición de rutas

Cada módulo exporta su árbol de rutas en `routes.jsx`:

```jsx
// src/modules/mazos/routes.jsx
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import MisColecciones from './pages/MisColecciones';
import DetalleColeccion from './pages/DetalleColeccion';
// ...

export const mazosRoutes = (
  <>
    <Route path="/colecciones" element={<ProtectedRoute requireRol="jugador"><MisColecciones /></ProtectedRoute>} />
    <Route path="/colecciones/:id" element={<ProtectedRoute requireRol="jugador"><DetalleColeccion /></ProtectedRoute>} />
    {/* ... */}
  </>
);
```

`AppRoutes.jsx` los compone:

```jsx
// src/routes/AppRoutes.jsx
import { Routes } from 'react-router-dom';
import { identidadRoutes } from '@/modules/identidad/routes';
import { mazosRoutes } from '@/modules/mazos/routes';
import { torneosRoutes } from '@/modules/torneos/routes';
import { dashboardsRoutes } from '@/modules/dashboards/routes';

export default function AppRoutes() {
  return (
    <Routes>
      {identidadRoutes}
      {mazosRoutes}
      {torneosRoutes}
      {dashboardsRoutes}
      {/* ... 404 al final */}
    </Routes>
  );
}
```

Esto permite que cada persona trabaje en las rutas de su módulo sin tocar `AppRoutes.jsx` constantemente.

---

## 14. Constantes y enums

`src/utils/constants.js`:

```js
export const ROLES = {
  JUGADOR: 'jugador',
  ORGANIZADOR: 'organizador',
  TIENDA: 'tienda',
};

export const FORMATOS = {
  COMMANDER: 'COMMANDER',
  STANDARD: 'STANDARD',
  MODERN: 'MODERN',
  PIONEER: 'PIONEER',
  LEGACY: 'LEGACY',
};

export const FORMATO_LABELS = {
  COMMANDER: 'Commander',
  STANDARD: 'Standard',
  MODERN: 'Modern',
  PIONEER: 'Pioneer',
  LEGACY: 'Legacy',
};

export const ESTADO_TORNEO = {
  PENDIENTE: 'pendiente',
  EN_CURSO: 'en_curso',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
};

export const ESTADO_ENFRENTAMIENTO = {
  PENDIENTE: 'pendiente',
  EN_CURSO: 'en_curso',
  FINALIZADO: 'finalizado',
};

export const TIPO_RONDA = {
  SWISS: 'swiss',
  ELIMINACION_DIRECTA: 'eliminacion_directa',
  FINAL: 'final',
};

export const RESULTADO_ENFRENTAMIENTO = {
  GANADOR: 'ganador',
  PERDEDOR: 'perdedor',
  EMPATE: 'empate',
  PENDIENTE: 'pendiente',
};
```

---

## 15. Endpoints del backend

Base URL: `${VITE_API_URL}`. Auth con `Authorization: Bearer <supabase_access_token>`.

**Auth**
- `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`

**Cartas (públicas)**
- `GET /cartas/buscar?q=...`, `GET /cartas`, `GET /cartas/:scryfallId`

**Colecciones (rol jugador)**
- `GET /colecciones/mia`
- `POST /colecciones/cartas`, `PATCH /colecciones/cartas/:cartaId`, `DELETE /colecciones/cartas/:cartaId`

**Mazos (rol jugador)**
- `GET /mazos`, `POST /mazos`, `GET /mazos/:id`
- `POST /mazos/:id/cartas`, `PATCH /mazos/:id/cartas/:cartaId`, `DELETE /mazos/:id/cartas/:cartaId`
- `POST /mazos/:id/validar`

**Torneos**
- `GET /torneos`, `POST /torneos` (auth), `GET /torneos/:id`
- `POST /torneos/:id/inscripciones` (rol jugador), `GET /torneos/:id/inscripciones`

**Rondas** (montadas bajo torneos)
- `POST /:torneoId/rondas` (auth), `GET /:torneoId/rondas`, `GET /:torneoId/rondas/:rondaId`

**Enfrentamientos**
- `GET /enfrentamientos/:id`
- `PATCH /enfrentamientos/:id/resultado` (auth), `PATCH /enfrentamientos/:id/estado` (auth)

**Tiendas**
- `GET /tiendas`, `GET /tiendas/cercanas`, `GET /tiendas/:id`
- `PUT /tiendas/:id` (auth), `GET /tiendas/:id/torneos`

---

## 16. Módulos del proyecto

El frontend se organiza en seis módulos. Cada módulo agrupa las pantallas y la lógica de un dominio funcional. Algunas funcionalidades están integradas dentro de otras pantallas (ej: el deck builder vive dentro de Detalle de Mazo) para mantener la app lo más simple posible.

### Módulo 1 — Identidad

Autenticación y perfiles públicos. Es el módulo de entrada al sistema y la base sobre la que se montan los demás.

**Pantallas:**

| # | Pantalla | Ruta | Tipo | Descripción |
|---|---|---|---|---|
| 1.1 | Login | `/login` | Inmersiva | Form email + password. Link a registro y recuperar pass. |
| 1.2 | Registro | `/registro` | Inmersiva | Form email, password, nombre_usuario, **selector de rol** (jugador/organizador/tienda). Crea el usuario y su perfil hijo correspondiente. |
| 1.3 | Recuperar contraseña | `/recuperar` | Inmersiva | Input email + botón. Usa `supabase.auth.resetPasswordForEmail`. |
| 1.4 | Perfil de jugador | `/u/:username` | Inmersiva | Avatar + nombre de usuario + estadísticas básicas (partidas ganadas/perdidas/empatadas, win rate, torneos participados) + sección de mazos públicos del jugador. **Si es el dueño del perfil**: tabs adicionales "Mis inscripciones" (lista editable de inscripciones a torneos) y "Mis estadísticas" (vista detallada). |
| 1.5 | Perfil de organizador | `/u/:username` | Inmersiva | Avatar + nombre + descripción + sitio web + lista de torneos publicados. **Si es el dueño**: tab "Mis torneos" editable (crear, editar, cancelar torneos). |
| 1.6 | Perfil de tienda | `/u/:username` | Inmersiva | Nombre tienda + dirección + teléfono + horario + mapa pequeño con su pin + lista de torneos publicados. |
| 1.7 | Configuración de cuenta | `/configuracion` | Operativa | Tabs según rol: <br>- **Cuenta** (todos): cambiar correo, password, eliminar cuenta. <br>- **Configuración de tienda** (solo rol tienda): editar nombre, dirección, teléfono, horario, lat/lng (con mapa para fijar coordenadas). |

**Notas de privacidad/diseño:**

- En el perfil del jugador se muestran estadísticas básicas pero **no** se exponen los torneos a los que asistirá próximamente (solo el dueño los ve en su tab "Mis inscripciones").
- En el perfil del organizador **no** se incluye el campo `verificado` (no está en la BD).
- Toda la info de los perfiles públicos se mantiene **minimalista**.

**Componentes clave:**
- `<EstadisticasJugador>`, `<DeckList>` (mazos públicos), `<TournamentCard>` (torneos del organizador/tienda), `<MapaTiendas>` (en perfil de tienda).

**Endpoints:**
- `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- `PUT /tiendas/:id` (configuración de tienda)
- Endpoints de perfil público y mis inscripciones/torneos: pueden estar **pendientes** en backend; mockear si es necesario.

---

### Módulo 2 — Mazos y Colecciones

Gestión de cartas que el jugador posee (colecciones) y mazos que arma para torneos. El asistente IA vive dentro de la edición de mazos.

**Pantallas:**

| # | Pantalla | Ruta | Tipo | Descripción |
|---|---|---|---|---|
| 2.1 | Mis colecciones | `/colecciones` | Operativa | Lista de "carpetas" de cartas del jugador. Botón crear, click para entrar al detalle. |
| 2.2 | Detalle de colección | `/colecciones/:id` | Operativa | Lista de cartas de la colección con cantidad y flag foil. **Barra de búsqueda integrada** para agregar cartas (consume `/cartas/buscar`). Editar cantidad inline, eliminar. |
| 2.3 | Mis mazos | `/mazos` | Operativa | Grid de mazos con FormatBadge, comandante (si aplica), fecha de actualización. Botón "Crear mazo". |
| 2.4 | Crear mazo | `/mazos/nuevo` (modal) | Inmersiva | Modal o página con: nombre, formato (default COMMANDER), descripción, público (toggle). Después de crear, redirige a Detalle de Mazo en modo edición. |
| 2.5 | Detalle de mazo | `/mazos/:id` | Operativa | Vista del mazo con dos modos: <br>**Modo lectura**: `<DeckList>` + `<DeckStats>` + info. <br>**Modo edición** (botón "Editar"): pasa a `<DeckBuilder>` con buscador integrado de cartas + lista del mazo + stats + **asistente IA embebido** (botón "Pedir recomendaciones"). Validación en tiempo real con `POST /mazos/:id/validar`. |

**Notas:**
- No existe una pantalla "deck builder" separada. La edición es un modo dentro de Detalle de Mazo.
- La barra de agregar cartas en Detalle de Colección y en Detalle de Mazo (modo edición) usa el mismo patrón: input de búsqueda + resultados como `<MTGCard variant="inline">`, click agrega.
- En mobile, el modo edición de mazo no usa 3 columnas: muestra solo la lista del mazo, el buscador en modal, y el panel de stats accesible desde un tab.

**Componentes clave:**
- `<DeckList>`, `<DeckStats>`, `<DeckBuilder>`, `<ColeccionEditor>`, `<MTGCard>`, `<ManaCost>`, `<FormatBadge>`, `<CommanderBadge>`.

**Endpoints:**
- Colecciones: `GET /colecciones/mia`, `POST/PATCH/DELETE /colecciones/cartas`.
- Mazos: `GET /mazos`, `POST /mazos`, `GET /mazos/:id`, `POST/PATCH/DELETE /mazos/:id/cartas`, `POST /mazos/:id/validar`.
- Cartas: `GET /cartas/buscar`, `GET /cartas/:scryfallId`.

---

### Módulo 3 — Torneos

Cartelera, detalle, inscripción y gestión de torneos. Las vistas "Mis inscripciones" (jugador) y "Mis torneos" (organizador/tienda) viven dentro del **perfil del usuario** (Módulo 1), no como pantallas separadas.

**Pantallas:**

| # | Pantalla | Ruta | Tipo | Descripción |
|---|---|---|---|---|
| 3.1 | Cartelera de torneos | `/torneos` | Inmersiva | Filtros: formato, estado, fecha. Búsqueda por nombre. Resultados como grid de `<TournamentCard>`. Paginación. |
| 3.2 | Detalle de torneo | `/torneos/:id` | Inmersiva | Header grande con info del torneo. Sección "Inscripción" (botón "Inscribirme" si jugador autenticado y no inscrito; selector de mazo). Sección "Inscritos". Sección "Rondas" si torneo `en_curso` o `finalizado` (`<RoundView>` con `<PodTable>`). |
| 3.3 | Crear torneo | `/organizador/torneos/nuevo` | Operativa | Form con nombre, formato, fecha, ubicación, lat/lng (mapa pequeño con pin draggable), cupo, precio. Submit a `POST /torneos`. |
| 3.4 | Editar torneo | `/organizador/torneos/:id/editar` | Operativa | Mismo form prepopulado. |
| 3.5 | Gestión de torneo en vivo | `/organizador/torneos/:id/gestion` | Operativa | Header con info + botón "Cambiar estado". Tabs por ronda. Crear ronda nueva. Cada ronda muestra sus pods. Reportar resultados, cambiar estado de enfrentamientos. |

**Integración con perfiles:**
- "Mis inscripciones" del jugador → tab dentro del perfil de jugador.
- "Mis torneos" del organizador/tienda → tab dentro del perfil correspondiente, con acciones para crear/editar/cancelar.

**Componentes clave:**
- `<TournamentCard>`, `<PodTable>`, `<RoundView>`, `<EstadoBadge>`, `<FormatBadge>`.

**Endpoints:**
- Torneos: `GET /torneos`, `POST /torneos`, `GET /torneos/:id`, `POST /torneos/:id/inscripciones`, `GET /torneos/:id/inscripciones`.
- Rondas: `POST /:torneoId/rondas`, `GET /:torneoId/rondas`, `GET /:torneoId/rondas/:rondaId`.
- Enfrentamientos: `GET /enfrentamientos/:id`, `PATCH /enfrentamientos/:id/resultado`, `PATCH /enfrentamientos/:id/estado`.

---

### Módulo 4 — Mapa

Visualización de tiendas en mapa. Es un **único componente reutilizable** que se monta como sección en la página principal/landing. El detalle de cada tienda **no tiene página propia**: el click en un pin lleva al perfil público de la tienda (Módulo 1). La edición de la tienda propia se hace desde "Configuración de tienda" en Configuración de cuenta (Módulo 1).

**Componentes:**

| # | Componente | Ubicación | Descripción |
|---|---|---|---|
| 4.1 | `<MapaTiendas>` | Landing (`/`) — sección | Mapa Leaflet con pins de todas las tiendas. Geolocalización del navegador para centrar (opcional). Click en pin abre popup con nombre + dirección + link "Ver tienda" → `/u/:username` (perfil público). |

**Endpoints:**
- `GET /tiendas`, `GET /tiendas/cercanas?lat&lng&radio`.

---

### Módulo 5 — Dashboards

Pantallas de inicio de cada rol. Personalizan la vista del usuario autenticado.

**Pantallas:**

| # | Pantalla | Ruta | Tipo | Descripción |
|---|---|---|---|---|
| 5.1 | Landing | `/` | Inmersiva | Hero del landing existente + features + sección con `<MapaTiendas>` + CTA. Componentizar el HTML actual a JSX. |
| 5.2 | Dashboard del jugador | `/jugador` | Operativa | Bloques: "Tus mazos recientes", "Próximos torneos cercanos", "Tu colección". CTAs a las pantallas correspondientes. |
| 5.3 | Dashboard del organizador | `/organizador` | Operativa | Stats rápidas (torneos creados, próximos, finalizados), lista de torneos recientes con acceso rápido a gestión y "Crear torneo". |
| 5.4 | Dashboard de la tienda | `/tienda` | Operativa | Similar al de organizador. Acceso rápido a "Configuración de tienda". |

**Notas:**
- "Mis estadísticas" del jugador **no es una pantalla separada**: es una sección del perfil de jugador (Módulo 1).
- El dashboard solo muestra resúmenes, no edición.

**Endpoints:**
- `GET /mazos`, `GET /torneos`, `GET /colecciones/mia`, `GET /tiendas/:id/torneos`.

---

### Módulo 6 — Layout y Compartido

Componentes y páginas transversales.

**Componentes:**

| # | Componente | Descripción |
|---|---|---|
| 6.1 | `<Navbar>` | Fija arriba, 64px. Cambia según auth y rol. Hamburguesa en mobile. |
| 6.2 | `<Sidebar>` | 240px, items según rol. Solo en pantallas operativas con muchas opciones. Offcanvas en mobile. |
| 6.3 | `<Footer>` | Minimal. Acerca de, contacto, redes. |
| 6.4 | `<AppLayout>` | Shell con Navbar + Sidebar (condicional) + Outlet + Footer. |
| 6.5 | `<ProtectedRoute>` | Redirige a `/login` si no autenticado, o a `/` si rol no coincide. |
| 6.6 | UI base | Button, Card, Modal, Input, Select, Textarea, Spinner, Badge, EmptyState, Tabs. |
| 6.7 | Components de dominio | MTGCard, ManaCost, DeckList, DeckStats, DeckBuilder, ColeccionEditor, TournamentCard, PodTable, RoundView, MapaTiendas, StorePin, FormatBadge, RoleBadge, EstadoBadge, CommanderBadge, EstadisticasJugador. |

**Pantallas auxiliares:**

| # | Pantalla | Ruta | Descripción |
|---|---|---|---|
| 6.8 | 404 | `*` | NotFound, estilo inmersivo simple. |
| 6.9 | 403 | `/forbidden` | Acceso denegado. |
| 6.10 | Loader inicial | — | Mientras se resuelve la sesión de Supabase. |

---

## 17. Orden de desarrollo recomendado

Los módulos tienen dependencias entre sí. El orden propuesto minimiza bloqueos y permite tener funcionalidad demostrable lo antes posible.

### Fase 1 — Fundamentos (Sprint 0)

**Objetivo**: dejar la app corriendo con layout y rutas placeholder.

- Setup del proyecto Vite + React.
- Tokens CSS, base CSS, tipografía, constantes (enums).
- **Módulo 6 completo** (excepto componentes de dominio que dependan de otros módulos): Navbar, Sidebar, Footer, AppLayout, ProtectedRoute, UI base, AuthContext, cliente Supabase, helper API.
- Routing skeleton con todas las rutas montadas a placeholder.

### Fase 2 — Identidad (Sprint 1)

**Objetivo**: que un usuario pueda registrarse, loguearse y ver su perfil.

- **Módulo 1**: Login, Registro, Recuperar contraseña.
- Perfiles públicos de los tres roles (versión minimalista, sin las secciones que dependen de otros módulos).
- Configuración de cuenta (tab "Cuenta").

### Fase 3 — Mazos y Colecciones (Sprint 2)

**Objetivo**: que un jugador pueda gestionar sus cartas y mazos.

- **Módulo 2 completo**: Mis colecciones, Detalle de colección con barra de agregar, Mis mazos, Crear mazo, Detalle de mazo con modo edición (deck builder + asistente IA mockeado).
- Componentes de dominio MTG: MTGCard, ManaCost, DeckList, DeckStats, DeckBuilder, ColeccionEditor.
- Mockear el asistente IA (botón visible, respuesta dummy o "Próximamente") hasta que esté el endpoint.

### Fase 4 — Torneos (Sprint 3)

**Objetivo**: ciclo completo de torneo (cartelera → inscripción → gestión → resultados).

- **Módulo 3**: Cartelera, Detalle de torneo con inscripción, Crear/Editar torneo, Gestión de torneo en vivo.
- Tabs en perfiles: "Mis inscripciones" (jugador), "Mis torneos" (organizador/tienda).
- Componentes de dominio: TournamentCard, PodTable, RoundView.

### Fase 5 — Mapa y Dashboards (Sprint 4)

**Objetivo**: cerrar la experiencia con mapa de tiendas y dashboards personalizados.

- **Módulo 4**: `<MapaTiendas>` integrado en el landing.
- **Módulo 5**: Dashboards de jugador, organizador, tienda. Landing finalizado con secciones.
- Pulir Configuración de tienda (Módulo 1).
- "Mis estadísticas" como sección del perfil del jugador.

### Fase 6 — Pulido final

- QA cruzado entre todas las pantallas.
- Ajuste responsive en los breakpoints clave (375, 768, 1280, 1920).
- Optimizaciones (lazy loading de imágenes de cartas, code splitting por módulo).
- Estados de error y empty states completos.
- Deploy a Vercel.

---

## 18. Conventional Commits

Toda commit debe seguir la especificación de Conventional Commits.

### Tipos

- `feat`: nueva funcionalidad.
- `fix`: corrección de bug.
- `refactor`: cambio interno sin alterar comportamiento.
- `style`: cambios de formato/CSS sin afectar lógica.
- `docs`: documentación.
- `test`: tests.
- `chore`: tareas de mantenimiento (deps, config).
- `perf`: mejora de rendimiento.

### Scopes (sugeridos por módulo)

- `identidad`, `mazos`, `colecciones`, `torneos`, `mapa`, `dashboards`, `layout`, `ui`, `auth`, `deck-builder`.

### Ejemplos

```
feat(identidad): agregar pantalla de perfil de jugador
feat(mazos): integrar barra de agregar cartas en detalle de colección
fix(deck-builder): corregir validación de comandante con mana cost vacío
refactor(ui): renombrar Button a AppButton para evitar colisión con Bootstrap
style(navbar): ajustar padding y line-height en mobile
chore: configurar eslint y prettier
docs(readme): documentar variables de entorno
```

---

## 19. Pendientes y decisiones futuras

Items abiertos que se resolverán según el alcance lo requiera:

- **Asistente IA**: endpoint del backend pendiente; mockear hasta que esté listo.
- **Endpoints de "Mis inscripciones" y "Mis torneos"**: confirmar si existen o están pendientes; mockear si es necesario.
- **Pairings de Commander**: cómo se generan (auto, manual, mixto). Define la UX de "Crear ronda".
- **Sistema de puntaje por mesa de Commander**: cómo se asignan puntos por victoria/empate/posición.
- **Embeddings de cartas**: script aparte para generar embeddings con OpenAI cuando `OPENAI_API_KEY` esté disponible.
- **Logo gráfico**: por ahora wordmark "DECKORA" en Cinzel Decorative dorado como placeholder.
- **Internacionalización**: solo español por ahora.
- **Modo público de mazo compartible**: `mazos.publico` y `mazos.slug` ya existen en BD; falta vista pública.
- **Refresh token**: manejado por el SDK de Supabase, no requiere lógica custom en el frontend.
- **Notificaciones**: in-app o email; tabla y endpoints pendientes.

---

*Última actualización: 2026-04-30. Este documento es la fuente de verdad. Cualquier cambio de alcance, diseño o estructura se actualiza acá antes de implementarse.*
