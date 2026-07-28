using Ambot365.Api.Contracts;
using Ambot365.Api.Data;
using Ambot365.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ambot365.Api.Endpoints;

public static class WebsiteEndpoints
{
    public static void MapWebsiteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/websites").WithTags("Websites");

        group.MapGet("/", async (AmbotDbContext db, bool? enabled, bool? featured, CancellationToken ct) =>
        {
            var query = db.Websites.AsNoTracking();

            if (enabled is not null)
            {
                query = query.Where(w => w.Enabled == enabled.Value);
            }

            if (featured is not null)
            {
                query = query.Where(w => w.Featured == featured.Value);
            }

            var websites = await query.OrderByDescending(w => w.CreatedAt).ToListAsync(ct);
            return Results.Ok(websites);
        });

        group.MapGet("/{id:guid}", async (Guid id, AmbotDbContext db, CancellationToken ct) =>
        {
            var website = await db.Websites.AsNoTracking().FirstOrDefaultAsync(w => w.Id == id, ct);
            return website is null ? Results.NotFound() : Results.Ok(website);
        });

        group.MapGet("/by-slug/{slug}", async (string slug, AmbotDbContext db, CancellationToken ct) =>
        {
            var website = await db.Websites.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == slug, ct);
            return website is null ? Results.NotFound() : Results.Ok(website);
        });

        group.MapPost("/", async (WebsiteRequest request, AmbotDbContext db, CancellationToken ct) =>
        {
            var title = request.Title?.Trim();
            if (string.IsNullOrEmpty(title))
            {
                return Results.BadRequest(new { success = false, error = "title is required" });
            }

            var url = request.Url?.Trim();
            if (!IsHttpUrl(url))
            {
                return Results.BadRequest(new { success = false, error = "url must be an http or https URL" });
            }

            var category = request.Category ?? Categories.Default;
            if (!Categories.IsValid(category))
            {
                return Results.BadRequest(new { success = false, error = $"Unknown category '{category}'" });
            }

            var website = new DemoWebsite
            {
                Title = title,
                Description = request.Description?.Trim() ?? string.Empty,
                Url = url!,
                ThumbnailUrl = Normalize(request.ThumbnailUrl),
                Category = category,
                Tags = CleanTags(request.Tags),
                Enabled = request.Enabled ?? true,
                Featured = request.Featured ?? false,
            };

            db.Websites.Add(website);
            await Slugs.SaveWithUniqueSlugAsync(db, website, Slugs.From(title), (w, s) => w.Slug = s, ct);

            return Results.Created($"/api/websites/{website.Id}", website);
        });

        group.MapPut("/{id:guid}", async (Guid id, WebsiteRequest request, AmbotDbContext db, CancellationToken ct) =>
        {
            var website = await db.Websites.FirstOrDefaultAsync(w => w.Id == id, ct);
            if (website is null)
            {
                return Results.NotFound();
            }

            if (request.Category is not null && !Categories.IsValid(request.Category))
            {
                return Results.BadRequest(new { success = false, error = $"Unknown category '{request.Category}'" });
            }

            if (request.Url is not null && !IsHttpUrl(request.Url.Trim()))
            {
                return Results.BadRequest(new { success = false, error = "url must be an http or https URL" });
            }

            var newTitle = request.Title?.Trim();
            var renamed = !string.IsNullOrEmpty(newTitle) && newTitle != website.Title;

            website.Title = string.IsNullOrEmpty(newTitle) ? website.Title : newTitle;
            website.Description = request.Description?.Trim() ?? website.Description;
            website.Url = request.Url?.Trim() ?? website.Url;
            website.ThumbnailUrl = request.ThumbnailUrl is null
                ? website.ThumbnailUrl
                : Normalize(request.ThumbnailUrl);
            website.Category = request.Category ?? website.Category;
            website.Tags = request.Tags is null ? website.Tags : CleanTags(request.Tags);
            website.Enabled = request.Enabled ?? website.Enabled;
            website.Featured = request.Featured ?? website.Featured;

            if (renamed)
            {
                await Slugs.SaveWithUniqueSlugAsync(db, website, Slugs.From(website.Title), (w, s) => w.Slug = s, ct);
            }
            else
            {
                await db.SaveChangesAsync(ct);
            }

            return Results.Ok(website);
        });

        group.MapDelete("/{id:guid}", async (Guid id, AmbotDbContext db, CancellationToken ct) =>
        {
            var deleted = await db.Websites.Where(w => w.Id == id).ExecuteDeleteAsync(ct);
            return deleted == 0 ? Results.NotFound() : Results.NoContent();
        });
    }

    // These URLs are loaded in an iframe by WebsitePreviewModal.tsx, so anything
    // outside http/https (javascript:, data:) must never reach the database.
    private static bool IsHttpUrl(string? value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);

    private static List<string> CleanTags(List<string>? tags) =>
        tags is null
            ? []
            : [.. tags.Select(t => t.Trim()).Where(t => t.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase)];

    private static string? Normalize(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }
}
