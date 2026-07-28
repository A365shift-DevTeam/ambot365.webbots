using Ambot365.Api.Contracts;
using Ambot365.Api.Data;
using Ambot365.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ambot365.Api.Endpoints;

public static class BotEndpoints
{
    public static void MapBotEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bots").WithTags("Bots");

        // enabled=true powers the public /bots listing; omitting it gives the
        // admin dashboard everything, disabled entries included.
        group.MapGet("/", async (AmbotDbContext db, bool? enabled, CancellationToken ct) =>
        {
            var query = db.Bots.AsNoTracking();

            if (enabled is not null)
            {
                query = query.Where(b => b.Enabled == enabled.Value);
            }

            var bots = await query.OrderByDescending(b => b.CreatedAt).ToListAsync(ct);
            return Results.Ok(bots);
        });

        group.MapGet("/{id:guid}", async (Guid id, AmbotDbContext db, CancellationToken ct) =>
        {
            var bot = await db.Bots.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id, ct);
            return bot is null ? Results.NotFound() : Results.Ok(bot);
        });

        group.MapGet("/by-slug/{slug}", async (string slug, AmbotDbContext db, CancellationToken ct) =>
        {
            var bot = await db.Bots.AsNoTracking().FirstOrDefaultAsync(b => b.Slug == slug, ct);
            return bot is null ? Results.NotFound() : Results.Ok(bot);
        });

        group.MapPost("/", async (BotRequest request, AmbotDbContext db, CancellationToken ct) =>
        {
            var name = request.Name?.Trim();
            if (string.IsNullOrEmpty(name))
            {
                return Results.BadRequest(new { success = false, error = "name is required" });
            }

            var scriptCode = request.ScriptCode?.Trim();
            if (string.IsNullOrEmpty(scriptCode))
            {
                return Results.BadRequest(new { success = false, error = "scriptCode is required" });
            }

            var category = request.Category ?? Categories.Default;
            if (!Categories.IsValid(category))
            {
                return Results.BadRequest(new { success = false, error = $"Unknown category '{category}'" });
            }

            var bot = new Bot
            {
                Name = name,
                Description = request.Description?.Trim() ?? string.Empty,
                ScriptCode = scriptCode,
                BackgroundImageUrl = Normalize(request.BackgroundImageUrl),
                MobileBackgroundImageUrl = Normalize(request.MobileBackgroundImageUrl),
                Category = category,
                Enabled = request.Enabled ?? true,
            };

            db.Bots.Add(bot);
            await Slugs.SaveWithUniqueSlugAsync(db, bot, Slugs.From(name), (b, s) => b.Slug = s, ct);

            return Results.Created($"/api/bots/{bot.Id}", bot);
        });

        group.MapPut("/{id:guid}", async (Guid id, BotRequest request, AmbotDbContext db, CancellationToken ct) =>
        {
            var bot = await db.Bots.FirstOrDefaultAsync(b => b.Id == id, ct);
            if (bot is null)
            {
                return Results.NotFound();
            }

            if (request.Category is not null && !Categories.IsValid(request.Category))
            {
                return Results.BadRequest(new { success = false, error = $"Unknown category '{request.Category}'" });
            }

            var newName = request.Name?.Trim();
            var renamed = !string.IsNullOrEmpty(newName) && newName != bot.Name;

            bot.Name = string.IsNullOrEmpty(newName) ? bot.Name : newName;
            bot.Description = request.Description?.Trim() ?? bot.Description;
            bot.ScriptCode = request.ScriptCode?.Trim() ?? bot.ScriptCode;
            bot.BackgroundImageUrl = request.BackgroundImageUrl is null
                ? bot.BackgroundImageUrl
                : Normalize(request.BackgroundImageUrl);
            bot.MobileBackgroundImageUrl = request.MobileBackgroundImageUrl is null
                ? bot.MobileBackgroundImageUrl
                : Normalize(request.MobileBackgroundImageUrl);
            bot.Category = request.Category ?? bot.Category;
            bot.Enabled = request.Enabled ?? bot.Enabled;

            if (renamed)
            {
                await Slugs.SaveWithUniqueSlugAsync(db, bot, Slugs.From(bot.Name), (b, s) => b.Slug = s, ct);
            }
            else
            {
                await db.SaveChangesAsync(ct);
            }

            return Results.Ok(bot);
        });

        group.MapDelete("/{id:guid}", async (Guid id, AmbotDbContext db, CancellationToken ct) =>
        {
            var deleted = await db.Bots.Where(b => b.Id == id).ExecuteDeleteAsync(ct);
            return deleted == 0 ? Results.NotFound() : Results.NoContent();
        });
    }

    // An empty string from a cleared admin form means "no image", which is NULL
    // in the database rather than a blank URL the browser would try to load.
    private static string? Normalize(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }
}
