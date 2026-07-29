# AMBOT 365 Catalog API

ASP.NET Core 9 minimal API over PostgreSQL. It owns the `bots` and `websites`
catalog that the React SPA in `web/` reads and that `/admin` edits.

## How it fits together

```
Browser ──► SPA (demo.ambot365.com, static IIS site, built from web/)
              │
              │  fetch, credentials: 'include'
              ▼
            this API (demoapi.ambot365.com) ──► PostgreSQL
                                           └──► ./uploads (image files on disk)
```

The browser calls this API directly. The admin session is a JWT in an httpOnly
cookie that JavaScript cannot read, so the SPA bundle carries no credential of
any kind and public `GET`s need none.

Because the SPA is served from a different host, every browser call is
cross-**origin** and the API must allow that origin explicitly
(`Cors:AllowedOrigins`). It is not cross-**site** — both hosts share the
registrable domain `ambot365.com` — so the cookie stays `SameSite=Lax`.

## Configuration

Two files, the standard ASP.NET Core layering — the base file is production, and
development overrides it.

| File | Published? | Purpose |
| --- | --- | --- |
| `appsettings.json` | yes | **The production configuration.** Ships to the server as-is; nothing is created there by hand. |
| `appsettings.Development.json` | no | Overrides every value above when `ASPNETCORE_ENVIRONMENT=Development`. |

Both are committed. `appsettings.json` therefore contains real production
credentials — the repository must stay private, and anyone with access to it has
them. The development file is committed too, deliberately: without it a fresh
clone would fall through to the production database.

The app **refuses to start** if the connection string, admin password, signing
key, or (outside Development) the CORS allow-list is missing. That is deliberate:
the alternative is an API that looks healthy while every admin action fails.

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

2. Adjust `Ambot365.Api/appsettings.Development.json` if your local Postgres
   password differs. It is already committed with working local defaults, so
   there is usually nothing to do here.

   Keep every production key overridden in that file. Removing one makes it fall
   through to `appsettings.json` — which points at the production database.

3. Run it:

   ```powershell
   dotnet run --project Ambot365.Api
   ```

   It listens on `http://localhost:5201`. `GET /health` needs no key and reports
   database connectivity.

4. Run the SPA against it:

   ```powershell
   cd ..\web
   npm install
   npm run dev
   ```

   It serves `http://localhost:5173` and proxies `/api` and `/uploads` to this
   API (`web/vite.config.ts`). Change the target by setting
   `VITE_DEV_API_ORIGIN` in `web/.env.development`.

## Deploying

See [`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) for the full IIS procedure —
both sites, prerequisites, verification, and a troubleshooting table keyed by
what the log actually says.

Two things that catch people out:

- **Publish, never copy `bin\Release\net9.0`.** Only `dotnet publish` generates
  `web.config`; without it IIS cannot run the app at all.
- **Do not rename settings files on the server.** `appsettings.json` is already
  the production configuration and arrives with the publish output. Renaming it
  leaves the app with no base configuration and it exits with *"No Postgres
  connection string"* — reported by IIS as an opaque 500.30.

## Endpoints

Public `GET`s are anonymous. Writes require the admin session cookie, which
`POST /api/auth/login` sets.

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
| `POST` | `/api/uploads` | Multipart image upload; returns a server-relative `/uploads/…` URL |
| `POST` | `/api/auth/login` | Sets the httpOnly session cookie |
| `POST` | `/api/auth/logout` | Clears it |
| `GET` | `/api/auth/me` | Whether the caller is authenticated |
| `GET` | `/health` | Anonymous; reports database connectivity |

Responses are the entities themselves, serialized camelCase — the exact shape of
`Bot` and `DemoWebsite` in `web/src/lib/types.ts`.

Upload URLs are stored server-relative so they stay portable. The SPA resolves
them against the API host via `assetUrl()` in `web/src/lib/api.ts` — rendering one
directly would resolve it against the SPA's own host, where nothing is served.

## Two things worth knowing

**Slugs.** Generated from the name/title using the same rules as the old
TypeScript `generateSlug`. Uniqueness is enforced by the unique index on `slug`;
on a conflict the API retries with `-1`, `-2`, and so on. The database constraint
is the real guarantee — a read-then-write check races under concurrent requests.

**Timestamps.** `created_at` and `updated_at` belong to the database (`default
now()` and the `set_updated_at` trigger). EF is configured to never write them
and to read the real values back, so no code path can forget to bump
`updated_at`.
