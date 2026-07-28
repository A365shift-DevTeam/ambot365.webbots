namespace Ambot365.Api.Data;

/// <summary>
/// Maps to the `bots` table in db/schema.sql. Property names serialize to
/// camelCase, which is exactly the `Bot` interface in src/lib/types.ts.
/// </summary>
public class Bot
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ScriptCode { get; set; } = string.Empty;
    public string? BackgroundImageUrl { get; set; }
    public string? MobileBackgroundImageUrl { get; set; }
    public string Category { get; set; } = Categories.Default;
    public bool Enabled { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Maps to the `websites` table. Matches `DemoWebsite` in src/lib/types.ts.
/// </summary>
public class DemoWebsite
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string Category { get; set; } = Categories.Default;
    public List<string> Tags { get; set; } = [];
    public bool Enabled { get; set; } = true;
    public bool Featured { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Mirrors the CHECK constraint in db/schema.sql and CATEGORIES in
/// src/lib/constants.ts. Validated here so a bad value returns 400 rather
/// than surfacing as a database error.
/// </summary>
public static class Categories
{
    public const string Default = "other";

    public static readonly IReadOnlySet<string> All = new HashSet<string>(StringComparer.Ordinal)
    {
        "education",
        "real-estate",
        "healthcare",
        "customer-support",
        "e-commerce",
        "hospitality",
        "finance",
        "other",
    };

    public static bool IsValid(string? value) => value is not null && All.Contains(value);
}
