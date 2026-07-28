using Ambot365.Api.Data;
using Ambot365.Api.Endpoints;
using Ambot365.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Both of these are secrets, so they live in environment variables or user-secrets
// rather than appsettings.json:
//   ConnectionStrings__Postgres, Api__Key
var connectionString = builder.Configuration.GetConnectionString("Postgres");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "No Postgres connection string. Set ConnectionStrings__Postgres (see api/README.md).");
}

var apiKey = builder.Configuration["Api:Key"];
if (string.IsNullOrWhiteSpace(apiKey))
{
    // Failing at startup beats booting an unauthenticated API that looks healthy.
    throw new InvalidOperationException("No API key configured. Set Api__Key (see api/README.md).");
}

builder.Services.AddDbContext<AmbotDbContext>(options =>
    options
        .UseNpgsql(connectionString)
        // The schema in db/schema.sql is snake_case; the C# properties are
        // PascalCase and serialize to camelCase. This convention is what keeps
        // src/lib/types.ts working without a single change.
        .UseSnakeCaseNamingConvention());

builder.Services.AddOpenApi(options => options.AddDocumentTransformer<ApiKeySecurityTransformer>());
builder.Services.AddProblemDetails();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // AddOpenApi/MapOpenApi only serve the JSON document; .NET 9 dropped the
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

// Scoped to /api so the health endpoint and the dev OpenAPI document stay reachable
// without a key. Everything that touches the database sits behind it.
app.UseWhen(
    context => context.Request.Path.StartsWithSegments("/api"),
    branch => branch.UseMiddleware<ApiKeyMiddleware>(apiKey));

app.MapGet("/health", async (AmbotDbContext db, CancellationToken ct) =>
{
    var reachable = await db.Database.CanConnectAsync(ct);
    return reachable
        ? Results.Ok(new { status = "ok", database = "up" })
        : Results.Json(new { status = "degraded", database = "down" }, statusCode: StatusCodes.Status503ServiceUnavailable);
});

app.MapBotEndpoints();
app.MapWebsiteEndpoints();

app.Run();
