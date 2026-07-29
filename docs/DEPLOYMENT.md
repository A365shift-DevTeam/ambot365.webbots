# Deploying to IIS

Two separate IIS sites on the same server:

| Site | Hostname | Physical path | Content | App pool |
|---|---|---|---|---|
| Frontend | `demo.ambot365.com` | `C:\inetpub\ambot365-web` | `web/dist` (static) | `Ambot365Web` |
| Backend | `demoapi.ambot365.com` | `C:\inetpub\ambot365-api` | `dotnet publish` output | `Ambot365Api` |

The browser loads the SPA from `demo.ambot365.com` and calls the API at
`demoapi.ambot365.com`. That is cross-**origin**, so the API must allow the SPA's
origin explicitly (`Cors:AllowedOrigins`). It is *not* cross-**site** — both hosts
sit under the registrable domain `ambot365.com` — so the session cookie stays
`SameSite=Lax`, which is both simpler and safer than `SameSite=None`.

---

## 0. Server prerequisites

Install these once, on the server:

1. **ASP.NET Core 9.0 Hosting Bundle** — <https://dotnet.microsoft.com/download/dotnet/9.0>
   (the *Hosting Bundle*, not the SDK or the standalone runtime). Then run
   `iisreset`. Verify:

   ```powershell
   dotnet --list-runtimes
   ```

   You need a `Microsoft.AspNetCore.App 9.0.x` line. Missing this is the single
   most common cause of a site that will not start.

2. **IIS URL Rewrite module** — <https://www.iis.net/downloads/microsoft/url-rewrite>
   Required by the frontend site's `web.config`. Without it IIS returns
   **500.19** on that site. See [If URL Rewrite is unavailable](#if-url-rewrite-is-unavailable)
   for the module-free option.

3. **TLS certificates** for both hostnames, bound in IIS.

---

## 1. Backend — `demoapi.ambot365.com`

### 1.1 Create the app pool

*IIS Manager → Application Pools → Add Application Pool*

| Setting | Value |
|---|---|
| Name | `Ambot365Api` |
| .NET CLR version | **No Managed Code** |
| Managed pipeline mode | Integrated |

"No Managed Code" is correct and required — ASP.NET Core runs its own runtime;
IIS only forwards requests to it.

### 1.2 Create the site

*IIS Manager → Sites → Add Website*

- Site name: `demoapi.ambot365.com`
- Application pool: `Ambot365Api`
- Physical path: `C:\inetpub\ambot365-api`
- Bindings: **https**, port 443, host name `demoapi.ambot365.com`, select the cert.
  Add an **http** port 80 binding too — the app redirects it to HTTPS, provided
  `HttpsRedirection:HttpsPort` is set in §1.5. Without that setting the redirect
  cannot determine a target port and quietly does nothing.

### 1.3 Publish on your machine

```powershell
cd "E:\Arul\DEMO SITES\Demo Web and Chatbots\ambot365.webbots\api\Ambot365.Api"

# Clear the output first. `dotnet publish` overwrites but never deletes, so any
# file from an earlier build survives — including appsettings.Development.json
# left over from before it was excluded, which would ship dev credentials.
Remove-Item E:\build -Recurse -Force -ErrorAction SilentlyContinue

dotnet publish -c Release -o E:\build
```

Use `dotnet publish`, **never** a copy of `bin\Release\net9.0`. Only publish
generates `web.config`, and without it IIS has no idea how to run the app.

Confirm the output contains `web.config` and `Ambot365.Api.dll`, and that it does
**not** contain `appsettings.Development.json` — the project excludes it so local
credentials can never reach the server.

### 1.4 Copy to the server

Stop the site first, or drop an `app_offline.htm` in the site root. Copying over a
running app pool leaves locked DLLs half-replaced, which produces a **500.30**
with a `TypeLoadException` or `FileLoadException` in the log.

Copy the publish output (`E:\build`, or wherever you sent it) to the server, then
run this on the server with `$source` pointing at the copied files:

```powershell
$source = 'C:\deploy\ambot365-api'      # the freshly published files
$site   = 'C:\inetpub\ambot365-api'     # the live site

'Updating…' | Out-File "$site\app_offline.htm" -Encoding utf8

robocopy $source $site /MIR `
  /XF app_offline.htm `
  /XD uploads logs

Remove-Item "$site\app_offline.htm"
```

`/MIR` mirrors the folder — `appsettings.json` is part of the publish output and
*should* be replaced on every deploy. The `/XD` exclusions keep uploaded images
and logs from being deleted.

### 1.5 Settings — nothing to create on the server

There are exactly two settings files, and **no file needs to be created or edited
on the server**:

| File | Published? | Applies when |
|---|---|---|
| `appsettings.json` | yes | Always — this *is* the production configuration |
| `appsettings.Development.json` | **no** | Only locally, where it overrides every value above |

Production values live in `api/Ambot365.Api/appsettings.json` in the repository.
Edit them there, republish, redeploy.

```json
{
  "ConnectionStrings": {
    "Postgres": "Host=localhost;Port=5432;Database=demosites;Username=postgres;Password=…"
  },
  "Admin": { "Password": "…", "JwtSecret": "…" },
  "Cors": { "AllowedOrigins": ["https://demo.ambot365.com"] },
  "HttpsRedirection": { "HttpsPort": 443 }
}
```

Notes that matter:

- `Host=localhost` is only right if Postgres runs on the IIS server itself.
- `AllowedOrigins` must match the browser's origin exactly — scheme, host, no
  trailing slash, no path. `https://demo.ambot365.com/` will not match.
- `JwtSecret` must be at least 32 bytes. Generate one with
  `powershell -c "[Convert]::ToBase64String((1..48|%{Get-Random -Max 256}))"`.
  Changing it invalidates every existing admin session.
- **Do not rename or hand-edit files on the server.** Renaming `appsettings.json`
  to `appsettings.Production.json` leaves the app with no base configuration at
  all, and it exits with *"No Postgres connection string"* — which IIS reports as
  **500.30**.

**The app deliberately refuses to start if the connection string, admin password,
signing key, or CORS origins are missing**, rather than booting into a state where
admin login silently fails. The reason is written to the log — see
[Reading the real startup error](#reading-the-real-startup-error).

### 1.6 Check `ASPNETCORE_ENVIRONMENT`

*Site → Configuration Editor → `system.webServer/aspNetCore` → environmentVariables*

There must be **no** `ASPNETCORE_ENVIRONMENT=Development` entry. Unset is correct —
the host defaults to Production. If it is set to Development, the app looks for
development overrides that were never published *and* exposes Swagger publicly.

### 1.7 Create the uploads folder and grant write access

Create it explicitly. The deploy excludes `uploads` so it is never wiped, which
also means the first deploy does not create it — and the app cannot create it
itself, because `ApplicationPoolIdentity` normally has no write access to the site
root:

```powershell
New-Item -ItemType Directory -Force C:\inetpub\ambot365-api\uploads
icacls C:\inetpub\ambot365-api\uploads /grant "IIS AppPool\Ambot365Api:(OI)(CI)M"
```

If this is missing the API still starts and serves the catalog — only uploads
fail, and the reason is logged. That is deliberate, but it means a broken uploads
folder looks like a healthy site: check step 8 in §3.

### 1.8 ModSecurity WAF — do this BEFORE the first deploy

`api/Ambot365.Api/web.config` enables ModSecurity. That element is only valid if
the native module is installed **and** its configuration section is unlocked. If
either is missing, IIS rejects the file and the entire site returns **500.19** —
so complete this section before deploying, or comment the `<ModSecurity>` element
out.

ModSecurity 3.x has no IIS connector. On Windows the current version is **2.9.7**.

**1. Install the module** (server, elevated). Download the ModSecurity IIS
installer and run it:

```powershell
msiexec /i ModSecurityIIS_2.9.7-64b.msi
iisreset
```

Confirm it registered:

```powershell
Get-WebGlobalModule | Where-Object Name -like '*ModSecurity*'
```

**2. Unlock the section.** The installer writes
`overrideModeDefault="Deny"`, which stops any site's `web.config` from setting
ModSecurity at all. Change it to `Allow`:

```powershell
$ah = "$env:windir\System32\inetsrv\config\applicationHost.config"
Copy-Item $ah "$ah.bak" -Force
(Get-Content $ah -Raw) -replace `
  '<section name="ModSecurity" overrideModeDefault="Deny"', `
  '<section name="ModSecurity" overrideModeDefault="Allow"' |
  Set-Content $ah -Encoding utf8
iisreset
```

**3. Install the OWASP Core Rule Set.** Extract it into the ModSecurity
installation folder, rename `crs-setup.conf.example` to `crs-setup.conf`, and
make sure `modsecurity_iis.conf` includes `crs-setup.conf` and `rules/*.conf`.
The `configFile` path in `web.config` must point at `modsecurity_iis.conf`.

**4. Start in detection-only mode.** The CRS blocks legitimate traffic until it
is tuned, and this API sends JSON bodies and `PUT`/`DELETE` verbs that generic
rules often flag. In `modsecurity_iis.conf`:

```
SecRuleEngine DetectionOnly
```

Watch the audit log for a few days, add exclusions for anything that would have
blocked real admin traffic, then switch to `SecRuleEngine On`.

**Rollback.** If the site returns 500.19 after deploying, comment the element out
and recopy:

```xml
<!-- <ModSecurity enabled="true" configFile="…" /> -->
```

Everything else in that `web.config` — request filtering, security headers — is
built into IIS and needs no module.

---

## 2. Frontend — `demo.ambot365.com`

### 2.1 Create the app pool and site

App pool `Ambot365Web`, **No Managed Code** (it serves static files only).

Site `demo.ambot365.com` → physical path `C:\inetpub\ambot365-web`, https binding
on 443 with the cert.

### 2.2 Build on your machine

```powershell
cd "E:\Arul\DEMO SITES\Demo Web and Chatbots\ambot365.webbots\web"
npm ci
npm run build
```

This reads `web/.env.production`, which sets:

```
VITE_API_BASE_URL=https://demoapi.ambot365.com
```

That value is **compiled into the JavaScript bundle**. Changing the API hostname
means editing `.env.production` and rebuilding — a redeploy alone will not pick
it up.

Output lands in `web/dist`, including `web.config` (copied from `web/public`).

### 2.3 Copy to the server

```powershell
robocopy .\dist C:\inetpub\ambot365-web /MIR
```

`/MIR` is safe here — the whole site is build output with nothing to preserve.

### 2.4 Verify the site is static

`C:\inetpub\ambot365-web\web.config` must contain the `<rewrite>` rule and must
**not** mention `aspNetCore` or `AspNetCoreModuleV2`. If the frontend folder ever
receives an API `web.config`, IIS will try to launch a .NET process for a folder
of static files and fail.

### If URL Rewrite is unavailable

If you cannot install the module, replace the `<rewrite>` block in
`web/public/web.config` with:

```xml
<httpErrors errorMode="Custom" existingResponse="Replace">
  <remove statusCode="404" subStatusCode="-1" />
  <error statusCode="404" path="/index.html" responseMode="ExecuteURL" />
</httpErrors>
```

This needs no module. The trade-off: deep links are served correctly, but crawlers
may see a 404 status on them unless `existingResponse="Replace"` is honoured by
your IIS configuration. URL Rewrite is the better option where possible.

---

## 3. Verify the deployment

Run these in order. Each one isolates a different layer.

| # | Check | Expected |
|---|---|---|
| 1 | Browse `https://demoapi.ambot365.com/` | `{"service":"AMBOT 365 Catalog API","status":"ok","environment":"Production"}` |
| 2 | Browse `https://demoapi.ambot365.com/health` | `{"status":"ok","database":"up"}` |
| 3 | Browse `https://demo.ambot365.com/` | The SPA home page renders |
| 4 | Go directly to `https://demo.ambot365.com/websites` | Page renders, **not** a 404 (proves SPA fallback works) |
| 5 | Open DevTools → Network, reload | `/api/websites` returns 200, no CORS error in Console |
| 6 | Log in at `https://demo.ambot365.com/admin` | Succeeds; DevTools → Application → Cookies shows `ambot365_session` with **HttpOnly** and **Secure** ticked |
| 7 | Reload the admin page | Still logged in (proves the cookie is being sent cross-origin) |
| 8 | Upload an image, then view it on a card | Image renders from `demoapi.ambot365.com/uploads/...` |

If step 2 says `"database":"down"`, the API is healthy but cannot reach Postgres —
check the connection string, that Postgres accepts remote connections, and the
firewall. This does not stop the site from starting.

---

## 4. Redeploying later

| Changed | Do |
|---|---|
| Backend C# | `dotnet publish` → §1.4 (keep the `/XF`/`/XD` exclusions) |
| Frontend | `npm run build` → §2.3 |
| API hostname | Edit `web/.env.production`, rebuild the frontend, update `Cors:AllowedOrigins`, restart the API site |
| Credentials | Edit `api/Ambot365.Api/appsettings.json` in the repo, republish, redeploy |

`uploads/` and `logs/` are never touched by a redeploy. Everything else, including
`appsettings.json`, is replaced.

---

## Troubleshooting

### HTTP Error 500.30 — ASP.NET Core app failed to start

The app process launched and then died. The page never shows why. Get the actual
error:

1. Edit `C:\inetpub\ambot365-api\web.config`:

   ```xml
   <aspNetCore ... stdoutLogEnabled="true" stdoutLogFile=".\logs\stdout" />
   ```

2. Create `C:\inetpub\ambot365-api\logs` and grant the app pool identity write
   access to it.
3. Restart the site and reload the page.
4. Read `logs\stdout_*.log`. Also check **Event Viewer → Windows Logs → Application**.
5. **Set `stdoutLogEnabled` back to `false`** — it grows without bound.

What you find maps to a cause:

| Log says | Cause | Fix |
|---|---|---|
| `No Postgres connection string…` | `appsettings.json` missing from the deploy, or **renamed** on the server | Recopy the publish output; see §1.5 |
| `No CORS origins configured…` | Same file present but `Cors:AllowedOrigins` empty | §1.5 |
| `Admin__JwtSecret must be set…` | Secret missing or under 32 bytes | §1.5 |
| `framework 'Microsoft.AspNetCore.App' version '9.0.0' was not found` | Hosting Bundle missing or older | §0.1 |
| `TypeLoadException` / `FileLoadException` | Files copied over a running app pool | Stop the site, recopy (§1.4) |
| Nothing from the app, only an ANCM event | App pool not "No Managed Code", or 32-bit enabled | §1.1 |

### 500.19

A `web.config` referencing a module that is not installed, or a locked section.
The two causes here:

- **`<ModSecurity>`** on the API site — module not installed, or the section is
  still `overrideModeDefault="Deny"` (§1.8).
- **`<rewrite>`** on the frontend site — URL Rewrite module missing (§0.2).

The response body usually names the offending element. Comment it out, confirm
the site returns, then fix the prerequisite.

### 403.14 — Directory listing denied

The site has no `web.config` at all, so IIS is treating it as a plain folder. On
the API side this means the folder is a `bin` copy rather than a publish (§1.3).

### CORS errors in the browser console

The message names the blocked origin. Compare it character for character with
`Cors:AllowedOrigins`. `http` vs `https`, a trailing slash, or `www.` all count as
different origins. Restart the API site after editing.

### Logged in, then immediately logged out

The session cookie is not coming back. Check in DevTools → Application → Cookies
that `ambot365_session` exists and is marked **Secure**. If the SPA is being served
over plain HTTP, a `Secure` cookie will not be stored — both sites must be HTTPS.

### Images broken after uploading

The URL should point at `demoapi.ambot365.com/uploads/...`. If it points at
`demo.ambot365.com`, the frontend was built without `VITE_API_BASE_URL` — rebuild
(§2.2). If it 404s on the API host, check the `uploads` folder permissions (§1.7).
