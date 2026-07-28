using Ambot365.Api.Data;
using Ambot365.Api.Endpoints;
using Ambot365.Api.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Secrets live in environment variables or user-secrets, not appsettings.json:
//   ConnectionStrings__Postgres, Admin__Password, Admin__JwtSecret
var connectionString = builder.Configuration.GetConnectionString("Postgres");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "No Postgres connection string. Set ConnectionStrings__Postgres (see api/README.md).");
}

// Throws at startup if the password or signing key is missing — better than
// booting an API whose admin routes silently accept nothing, or everything.
var auth = AuthOptions.FromConfiguration(builder.Configuration);

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

app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await context.Response.WriteAsJsonAsync(new { success = false, error = "Internal server error" });
}));

// Serves the built SPA from wwwroot. Same-origin hosting is what lets the
// session stay in an httpOnly cookie and removes the need for CORS entirely.
app.UseDefaultFiles();
app.UseStaticFiles();

// Uploaded images are served from their own directory outside wwwroot, so a
// frontend build (which empties wwwroot) can never delete them.
var uploadsPath = UploadEndpoints.UploadsPath(app.Environment);
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
});

app.UseAuthentication();
app.UseAuthorization();

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

// Client-side routes such as /admin/edit/123 must return index.html rather than
// a 404, so React Router can resolve them. /api and /uploads are excluded.
app.MapFallbackToFile("index.html");

app.Run();
