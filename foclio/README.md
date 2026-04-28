# Foclio — Your video learning space

> Watch. Note. Remember.

A distraction-free video learning workspace with timestamped notes,
smart resume, personal library, and optional cloud sync via Supabase.

---

## Quick start (no backend needed)

```bash
npm install
npm run dev
```

Works immediately in guest mode — everything saved to localStorage.

---

## Add Supabase (optional, for cross-device sync)

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** → paste `schema.sql` → **Run**
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
6. Restart dev server

---

## Deploy to Vercel

```bash
# Push to GitHub → import on vercel.com
# Add the two VITE_ env vars in Vercel dashboard
# After deploy, update in Supabase:
#   Authentication → URL Configuration → Site URL = your Vercel URL
#   Authentication → Providers → Google → add Vercel URL to Redirect URLs
```

---

## Project structure

```
src/
├── App.jsx                 Root: AuthProvider, theme, toasts, keyboard shortcuts
├── main.jsx
├── index.css               Design tokens, skeleton, yt-container, scrollbar
│
├── lib/
│   ├── supabase.js         Safe client init (null if unconfigured)
│   └── db.js               All data ops — auth, library, progress, notes
│                           Every function has localStorage fallback
│
├── hooks/
│   ├── useAuth.js          Auth context — no infinite loops, clean unsubscribe
│   ├── useNotes.js         Notes CRUD with dual mode
│   ├── useLibrary.js       Library CRUD with dual mode
│   ├── useToast.js         Toast queue
│   ├── useTheme.js         Dark/light toggle
│   └── useLocalStorage.js  Typed localStorage state
│
├── utils/
│   └── video.js            URL parsing, timestamp format, copyText with fallback
│
├── components/
│   ├── ui.jsx              All reusable primitives: Button, IconButton, Skeleton,
│   │                       Badge, EmptyState, ErrorState, and all icons
│   ├── Navbar.jsx
│   ├── UrlInput.jsx        Auto-submit on paste, clean error states
│   ├── VideoPlayer.jsx     iframe-only, no YT API dependency, skeleton loader,
│   │                       error state, resume banner, floating save button,
│   │                       speed/restart/copy/open/fullscreen controls
│   ├── NotesPanel.jsx      Add/edit/delete/star/search, active note highlight
│   ├── LibrarySidebar.jsx  Saved videos with progress bars, remove
│   ├── AuthModal.jsx       Google + magic link email
│   ├── EmptyLanding.jsx    Decorative illustration
│   └── ToastContainer.jsx  Animated toasts
│
└── pages/
    └── ViewerPage.jsx      3-panel layout, sidebar, responsive, overflow fixed
```

---

## What was fixed (v1 → v2)

| Issue | Fix |
|---|---|
| Infinite loader / blank screen | Skeleton shows immediately; `iframeLoaded` state drives opacity transition |
| Speed change freezes video | Removed YT IFrame API postMessage hacks; speed now reloads iframe with `&start=` |
| Copy link UI break | `copyText()` util with `execCommand` fallback for when iframe has focus |
| iframe re-renders | `src` state only changes on explicit user actions; no inline computed props |
| Overflow / scroll broken | `h-screen overflow-hidden` on root; each panel scrolls independently |
| Video blocks content | Floating save button top-right; auth prompt in navbar — never covers player |
| Infinite re-renders in useAuth | `useEffect` has empty deps `[]`; single subscription, clean unsubscribe |
| Hanging promises | All async ops have `cancelled` guards + try/catch |
| Blank screen on error | Every async state has `error` UI with friendly message |
| No Supabase graceful fallback | `supabase = null` check in every db function; localStorage used instead |
| App rename | All references updated to Foclio |

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `Esc` | Exit fullscreen |
