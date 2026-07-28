namespace Ambot365.Api.Endpoints;

public static class UploadEndpoints
{
    private const long MaxBytes = 8 * 1024 * 1024;

    // Allow-list rather than block-list: anything not named here is refused,
    // so a new dangerous extension can't slip through by omission.
    private static readonly Dictionary<string, string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".png"] = "image/png",
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".gif"] = "image/gif",
        [".webp"] = "image/webp",
        [".svg"] = "image/svg+xml",
        [".avif"] = "image/avif",
    };

    /// <summary>
    /// Uploaded files live in {ContentRoot}/uploads, deliberately outside
    /// wwwroot: wwwroot is the SPA's build output directory and gets emptied on
    /// every frontend build, which would take user images with it.
    /// </summary>
    public static string UploadsPath(IWebHostEnvironment environment) =>
        Path.Combine(environment.ContentRootPath, "uploads");

    public static void MapUploadEndpoints(this IEndpointRouteBuilder app, IWebHostEnvironment environment)
    {
        app.MapPost("/api/uploads", async (IFormFile? file, CancellationToken ct) =>
        {
            if (file is null || file.Length == 0)
            {
                return Results.BadRequest(new { success = false, error = "No file uploaded" });
            }

            if (file.Length > MaxBytes)
            {
                return Results.BadRequest(new { success = false, error = "File exceeds the 8 MB limit" });
            }

            var extension = Path.GetExtension(file.FileName);
            if (!AllowedTypes.TryGetValue(extension, out var contentType))
            {
                return Results.BadRequest(new
                {
                    success = false,
                    error = $"Unsupported file type '{extension}'. Allowed: {string.Join(", ", AllowedTypes.Keys)}",
                });
            }

            // The stored name is generated, never derived from user input — that
            // rules out path traversal and collisions in one step.
            var storedName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
            var uploadsDirectory = UploadsPath(environment);
            Directory.CreateDirectory(uploadsDirectory);

            await using (var stream = File.Create(Path.Combine(uploadsDirectory, storedName)))
            {
                await file.CopyToAsync(stream, ct);
            }

            return Results.Ok(new { success = true, url = $"/uploads/{storedName}", contentType });
        })
        .DisableAntiforgery()
        .RequireAuthorization()
        .WithTags("Uploads");
    }
}
