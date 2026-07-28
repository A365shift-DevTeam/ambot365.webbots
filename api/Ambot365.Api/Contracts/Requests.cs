namespace Ambot365.Api.Contracts;

/// <summary>
/// Mirrors BotFormData in src/lib/types.ts. Every field is nullable so the same
/// shape serves POST (missing fields fall back to defaults, required ones are
/// validated) and PUT (missing fields mean "leave unchanged").
/// </summary>
public record BotRequest(
    string? Name,
    string? Description,
    string? ScriptCode,
    string? BackgroundImageUrl,
    string? MobileBackgroundImageUrl,
    string? Category,
    bool? Enabled);

/// <summary>
/// Mirrors WebsiteFormData in src/lib/types.ts. Nullable for the same reason.
/// </summary>
public record WebsiteRequest(
    string? Title,
    string? Description,
    string? Url,
    string? ThumbnailUrl,
    string? Category,
    List<string>? Tags,
    bool? Enabled,
    bool? Featured);
