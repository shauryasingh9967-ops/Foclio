# Foclio — Your Video Learning Space

> Watch. Note. Remember.

A distraction-free video learning workspace with **timestamped notes**, **smart resume**, a **personal library**, and optional **cloud sync via Supabase**. Runs instantly in guest mode with localStorage — no backend required.

**Live demo:** https://foclio-git-main-shauryasingh9967-ops-projects.vercel.app/

---

## Features

- Paste any video URL and start watching — iframe player, no YouTube API dependency
- Timestamped notes with add / edit / delete / star / search
- Active-note highlighting synced to playback
- Personal library with progress bars and resume-from-last-position
- Playback controls: speed, restart, copy link, open original, fullscreen
- Dark / light theme with persistence
- Guest mode (localStorage) or cloud sync (Supabase + Google auth / magic-link email)
- Animated toasts, skeleton loaders, and graceful empty/error states
- Responsive 3-panel layout; keyboard shortcuts

## Tech Stack

| Layer      | Tech                                   |
|------------|----------------------------------------|
| Frontend   | React 18, Vite 5                       |
| Styling    | Tailwind CSS, PostCSS                   |
| Backend    | Supabase (optional — Postgres + Auth)  |
| Storage    | localStorage fallback in every data op |
| Deploy     | Vercel                                  |

---

## Quick Start (no backend needed)

```bash
cd foclio
npm install
npm run dev
```

Works immediately in guest mode — everything is saved to localStorage.

## Add Supabase (optional, for cross-device sync)

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** → paste `foclio/schema.sql` → **Run**
3. Go to **Authentication → Providers** → enable **Google**
4. Copy env file:
   ```bash
   cp .env.example .env.local
   ```
5. Fill in your keys from **Settings → API**:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Restart the dev server

## Deploy to Vercel

```bash
# Push to GitHub → import on vercel.com
# Add the two VITE_ env vars in the Vercel dashboard
# After deploy, update in Supabase:
#   Authentication → URL Configuration → Site URL = your Vercel URL
#   Authentication → Providers → Google → add Vercel URL to Redirect URLs
```

---

## Project Structure

```
foclio/
├── src/
│   ├── App.jsx                 Root: AuthProvider, theme, toasts, keyboard shortcuts
│   ├── lib/
│   │   ├── supabase.js         Safe client init (null if unconfigured)
│   │   └── db.js               All data ops — auth, library, progress, notes
│   │                           Every function has a localStorage fallback
│   ├── hooks/                  useAuth, useNotes, useLibrary, useToast, useTheme
│   ├── utils/video.js          URL parsing, timestamp format, copyText fallback
│   ├── components/             Player, notes panel, library sidebar, auth modal, UI kit
│   └── pages/ViewerPage.jsx    3-panel layout, responsive, overflow fixed
└── schema.sql                  Supabase tables + RLS for cloud sync
```

For the full write-up (architecture, component map, v1 → v2 fixes), see [`foclio/README.md`](./foclio/README.md).

---

## License

MIT — see [LICENSE](./LICENSE).

*Built by Shaurya Singh*
