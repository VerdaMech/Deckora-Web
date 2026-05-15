# Deckora Web

Frontend de Deckora — plataforma web para la comunidad de Magic: The Gathering.

Stack: React 18 + Vite + react-bootstrap + Supabase Auth.

## Setup

```bash
git clone https://github.com/VerdaMech/Deckora-Web.git
cd Deckora-Web
npm install
cp .env.example .env  # luego completar con credenciales reales
npm run dev
```

## Documentación

- `DECKORA_FRONTEND.md` — especificación técnica completa.
- `PROJECT_TODO.md` — estado del proyecto y tareas pendientes.

## Deploy

### Frontend en Vercel

1. Importa el repositorio desde GitHub en https://vercel.com/new
2. Vercel detecta automáticamente el framework (Vite). El `vercel.json` ya configura el comando de build y los rewrites SPA.
3. Configura las variables de entorno en el dashboard de Vercel:

   | Variable | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
   | `VITE_SUPABASE_ANON_KEY` | Anon key pública de Supabase |
   | `VITE_API_URL` | `https://deckora-api.onrender.com` |

4. Deploy. La primera build toma ~2 minutos.

### Notas operativas

- El backend en Render (plan free) entra en sleep tras 15 minutos sin tráfico. La primera petición del día puede tardar 30-60 segundos. La app maneja este caso mostrando un mensaje de "el servidor está despertando" en los spinners iniciales.
- Para ramas de preview (PR), Vercel genera URLs automáticas. Verifica que las variables de entorno estén configuradas también para el entorno de preview, no solo producción.

### Build local

```bash
npm install
npm run build
npm run preview   # sirve el build en local en http://localhost:4173
```
