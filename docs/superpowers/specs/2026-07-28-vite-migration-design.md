# AMBOT 365 — React + Vite migration

**Date:** 2026-07-28
**Status:** Approved

## Goal

Replace the Next.js frontend with a React + Vite SPA, keeping the .NET catalog
API and PostgreSQL. Remove Supabase from the project entirely.

## The constraint that shapes everything

Vite produces a static bundle. Anything the browser needs is readable in
devtools. Today five server-side pieces hold secrets: `src/lib/api.ts`
(`AMBOT_API_KEY`), `src/lib/auth.ts` (JWT signing), `src/proxy.ts` (admin
guard), `src/app/api/*` (auth wrapper), and `src/app/api/upload`
(Supabase service-role key). A literal port would publish both secrets.

So authentication moves into the .NET API, and the shared API key is deleted
rather than relocated.

## Architecture

```
DEV:   Vite dev server :5173  --proxy /api-->  .NET API :5201  -->  Postgres
PROD:  .NET API :5201  serves wwwroot/ (built SPA) + /api/*    -->  Postgres
```

The .NET API serves the built SPA. The browser therefore sees a single origin
in both modes, which buys three things:

- **No CORS.** Nothing to misconfigure between environments.
- **httpOnly cookie sessions.** The JWT never reaches JavaScript, so an XSS bug
  cannot exfiltrate it. A `localStorage` Bearer token — the usual SPA default —
  would be a security downgrade from the current Next.js setup.
- **No secret in the bundle.** `ApiKeyMiddleware` is deleted, not moved.

## API surface

| Route | Auth | Notes |
| --- | --- | --- |
| `POST /api/auth/login` | anonymous | Validates password, sets httpOnly cookie |
| `POST /api/auth/logout` | anonymous | Clears the cookie |
| `GET /api/auth/me` | anonymous | Reports whether the caller is signed in |
| `GET /api/bots`, `/api/websites` (+ `/{id}`, `/by-slug/{slug}`) | anonymous | The catalog is public |
| `POST`/`PUT`/`DELETE` on bots and websites | **authorized** | |
| `POST /api/uploads` | **authorized** | Saves to `wwwroot/uploads`, returns `/uploads/{name}` |
| `GET /health` | anonymous | |

Public `GET`s are anonymous because the catalog is public anyway — requiring a
credential would mean shipping one to the browser, which is the problem being
solved.

## Frontend

New `web/` directory, sibling to `api/` and `db/`. React 19 + Vite + React
Router + Tailwind v4.

Most existing components are already plain React and Tailwind; they port with
mechanical edits: `next/link` → React Router `Link`, drop `'use client'`,
`useRouter` → `useNavigate`, `generateMetadata` → `document.title`.

Genuinely rewritten:

- `App.tsx` — React Router route table
- The five server components become client pages that fetch on mount
- `src/proxy.ts` → a `<ProtectedRoute>` component
- `src/lib/api.ts` → plain fetch client, no key, `credentials: 'include'`

## Removed

`src/app/api/*` (7 route handlers), `src/lib/auth.ts`, `src/proxy.ts`, the whole
Next.js app, and the `@supabase/supabase-js`, `@vercel/kv`, and `next`
dependencies. Uploads go to disk in the API, so Supabase leaves entirely.

## Accepted trade-offs

1. **No SSR or per-page metadata.** `/bot/:slug` and `/website/:slug` currently
   emit a real title and description per demo. As an SPA, every shared link
   shows one generic preview. Accepted; fixable later with prerendering.
2. **Vercel no longer hosts the whole app.** The API needs a .NET host, and the
   SPA ships with it.
3. Initial load is blank until JavaScript boots.

## Unchanged

`db/schema.sql` stays the source of truth. No EF migrations. The `bots` and
`websites` tables and the entity mapping are untouched.
