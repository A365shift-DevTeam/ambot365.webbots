using Ambot365.Api.Data;
using Ambot365.Api.Endpoints;
using Ambot365.Api.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// appsettings.json holds the production configuration and is what ships to the
// server; appsettings.Development.json overrides it locally and is never
// published. See docs/DEPLOYMENT.md.
var connectionString = builder.Configuration.GetConnectionString("Postgres");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "No Postgres connection string. Set ConnectionStrings:Postgres in "
            + "appsettings.json (see docs/DEPLOYMENT.md).");
}

// Throws at startup if the password or signing key is missing — better than
// booting an API whose admin routes silently accept nothing, or everything.
var auth = AuthOptions.FromConfiguration(builder.Configuration, builder.Environment.IsDevelopment());

// The SPA is served from its own host, so every browser call to this API is
// cross-origin and needs an explicit allow-list. AllowCredentials rules out a
// "*" wildcard: the origins must be spelled out.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
if (allowedOrigins.Length == 0 && !builder.Environment.IsDevelopment())
{
    // Failing here is deliberate. With no origins configured the API still
    // answers curl and health checks perfectly, while every browser request
    // from the SPA dies in preflight — a failure that looks like a frontend bug
    // and costs hours. Better to refuse to start and say why.
    throw new InvalidOperationException(
        "No CORS origins configured. Set Cors:AllowedOrigins to the SPA's exact origin "
            + "(for example https://demo.ambot365.com) in appsettings.json "
            + "(see docs/DEPLOYMENT.md).");
}

builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins(allowedOrigins)
    .AllowCredentials()
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services.AddDbContext<AmbotDbContext>(options =>
    options
        .UseNpgsql(connectionString)
        // db/schema.sql is snake_case; the C# properties are PascalCase and
        // serialize to camelCase, which is what the SPA consumes.
        .UseSnakeCaseNamingConvention());

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            IssuerSigningKey = auth.SigningKey,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            // Single-audience internal API: there is no issuer or audience to check.
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.FromMinutes(1),
        };

        // The token arrives in an httpOnly cookie, never an Authorization header,
        // so JavaScript in the SPA can neither read nor forward it.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies[AuthOptions.CookieName];
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // AddOpenApi/MapOpenApi serve only the JSON document; .NET 9 dropped the
    // bundled UI from the template. Swashbuckle's UI renders that document.
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "AMBOT 365 Catalog API");
        options.RoutePrefix = "swagger";
        options.DocumentTitle = "AMBOT 365 Catalog API";
    });
}
else
{
    // Both sites are HTTPS in production. HSTS tells the browser to refuse the
    // plain-HTTP version outright, which also keeps the Secure session cookie
    // from ever being solicited over an unencrypted connection.
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await context.Response.WriteAsJsonAsync(new { success = false, error = "Internal server error" });
}));

// CORS runs before authentication so that a rejected preflight never reaches
// the auth pipeline, and so failures surface as CORS errors rather than 401s.
app.UseCors();

// This app serves the API and uploaded files only. The SPA is a separate IIS
// site (demo.ambot365.com) built from web/dist — see docs/DEPLOYMENT.md.
//
// Creating this directory must never take the whole API down: under IIS the app
// pool identity often cannot write to the site root, and an unhandled throw here
// surfaces as an opaque HTTP 500.30 with the real cause buried in a log. Serving
// the catalog is far more important than serving uploads, so failure is logged
// and the site keeps running — the upload endpoint reports the problem instead.
var uploadsPath = UploadEndpoints.UploadsPath(app.Environment);
try
{
    Directory.CreateDirectory(uploadsPath);

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(uploadsPath),
        RequestPath = "/uploads",
    });
}
catch (Exception ex)
{
    app.Logger.LogError(
        ex,
        "Could not prepare the uploads directory at {UploadsPath}. Image uploads and "
            + "previously uploaded images will be unavailable until the application "
            + "identity has write access to this path.",
        uploadsPath);
}

app.UseAuthentication();
app.UseAuthorization();

// A deployed API root that answers instead of 404ing is the quickest way to
// confirm the site is up and running the build you think it is.
app.MapGet("/", () => Results.Ok(new
{
    service = "AMBOT 365 Catalog API",
    status = "ok",
    environment = app.Environment.EnvironmentName,
}));

app.MapGet("/health", async (AmbotDbContext db, CancellationToken ct) =>
{
    var reachable = await db.Database.CanConnectAsync(ct);
    return reachable
        ? Results.Ok(new { status = "ok", database = "up" })
        : Results.Json(new { status = "degraded", database = "down" }, statusCode: StatusCodes.Status503ServiceUnavailable);
});

app.MapAuthEndpoints(auth);
app.MapBotEndpoints();
app.MapWebsiteEndpoints();
app.MapUploadEndpoints(app.Environment);

// No SPA fallback here on purpose. Client-side routes are resolved by the SPA's
// own IIS site (web/public/web.config rewrites unmatched paths to index.html);
// an unmatched path on the API is a genuine 404.

app.Run();
