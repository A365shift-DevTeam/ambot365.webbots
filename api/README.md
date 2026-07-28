# AMBOT 365 Catalog API

ASP.NET Core 9 minimal API over PostgreSQL. It owns the `bots` and `websites`
catalog that the Next.js site reads and that `/admin` edits.

## How it fits together

```
Browser ──► Next.js ──── X-API-Key ────► this API ──► PostgreSQL
              │        (server to server)
              └──► Supabase Storage (image uploads only)
```

The browser never calls this API directly. Next.js route handlers authenticate
the admin with the existing session cookie (`src/lib/auth.ts`), then call here
with a shared key. That means no CORS, no cookies, and no JWT secret to share.

## Schema

`db/schema.sql` at the repo root is the source of truth. There are **no EF
migrations** on purpose, so the two can't drift. If you change the schema, edit
that file, re-run it, and update `Data/Entities.cs` to match.

## Setup

1. Create the database and apply the schema:

   ```powershell
   & 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -c 'create database ambot365'
   & 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -d ambot365 -f ..\db\schema.sql
   ```

2. Fill in `Ambot365.Api/appsettings.Development.json` (gitignored):

   ```json
   {
     "ConnectionStrings": { "Postgres": "Host=localhost;Port=5432;Database=ambot365;Username=postgres;Password=..." },
     "Api": { "Key": "a-long-random-string" }
   }
   ```

   The app throws at startup if either is missing — better than booting an
   unauthenticated API that looks healthy.

3. Run it:

   ```powershell
   dotnet run --project Ambot365.Api
   ```

   It listens on `http://localhost:5201`. `GET /health` needs no key and reports
   database connectivity.

4. Point the Next.js app at it in `.env.local` at the repo root. Copy
   `.env.local.example` and fill it in — and note that the two `AMBOT_*` vars are
   **added to** the existing ones, not a replacement for them:

   ```
   AMBOT_API_URL=http://localhost:5201
   AMBOT_API_KEY=the-same-long-random-string
   ```

   `AMBOT_API_KEY` has no `NEXT_PUBLIC_` prefix by design — `src/lib/api.ts` is
   server-only and the key must never reach the browser. It has to match
   `Api:Key` exactly; if it doesn't, the site raises an explicit "rejected the
   API key" error rather than quietly showing an empty catalog.

   Do not create a `.env.local` containing only these two variables. The app
   silently falls back to insecure defaults for anything missing:

   | Missing variable | Silent consequence |
   | --- | --- |
   | `JWT_SECRET` | Sessions are signed with the hardcoded `fallback-secret-change-me` (`src/lib/auth.ts:6`) |
   | `ADMIN_PASSWORD` | `/admin/login` accepts `admin123` (`src/lib/auth.ts:49`) |
   | `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Image uploads stop going to Supabase Storage and start writing to `public/uploads` on local disk (`src/app/api/upload/route.ts:34`) |

   Supabase is still required for image uploads. The .NET API replaced Supabase
   as the *database*, not as the file store.

## Endpoints

Every `/api/*` route requires the `X-API-Key` header.

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/api/bots` | `?enabled=true` for the public listing; omit for admin |
| `GET` | `/api/bots/{id}` | |
| `GET` | `/api/bots/by-slug/{slug}` | |
| `POST` | `/api/bots` | `name` and `scriptCode` required |
| `PUT` | `/api/bots/{id}` | Omitted fields are left unchanged |
| `DELETE` | `/api/bots/{id}` | |
| `GET` | `/api/websites` | Also accepts `?featured=true` |
| `GET` | `/api/websites/{id}` | |
| `GET` | `/api/websites/by-slug/{slug}` | |
| `POST` | `/api/websites` | `title` and an http/https `url` required |
| `PUT` | `/api/websites/{id}` | Omitted fields are left unchanged |
| `DELETE` | `/api/websites/{id}` | |

Responses are the entities themselves, serialized camelCase — the exact shape of
`Bot` and `DemoWebsite` in `src/lib/types.ts`.

## Two things worth knowing

**Slugs.** Generated from the name/title using the same rules as the old
TypeScript `generateSlug`. Uniqueness is enforced by the unique index on `slug`;
on a conflict the API retries with `-1`, `-2`, and so on. The database constraint
is the real guarantee — a read-then-write check races under concurrent requests.

**Timestamps.** `created_at` and `updated_at` belong to the database (`default
now()` and the `set_updated_at` trigger). EF is configured to never write them
and to read the real values back, so no code path can forget to bump
`updated_at`.
