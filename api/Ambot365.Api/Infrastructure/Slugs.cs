using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Ambot365.Api.Infrastructure;

public static class Slugs
{
    private const int MaxSuffixAttempts = 50;

    /// <summary>
    /// Same rules as generateSlug() in the Next.js lib: lowercase, every run of
    /// non-alphanumerics becomes a single dash, no leading or trailing dash.
    /// The result satisfies the slug_format CHECK constraint in db/schema.sql.
    /// </summary>
    public static string From(string input)
    {
        var chars = new List<char>(input.Length);
        var lastWasDash = true; // seeded true so a leading dash is never emitted

        foreach (var raw in input)
        {
            var ch = char.ToLowerInvariant(raw);
            if (char.IsAsciiLetterLower(ch) || char.IsAsciiDigit(ch))
            {
                chars.Add(ch);
                lastWasDash = false;
            }
            else if (!lastWasDash)
            {
                chars.Add('-');
                lastWasDash = true;
            }
        }

        if (chars.Count > 0 && chars[^1] == '-')
        {
            chars.RemoveAt(chars.Count - 1);
        }

        return chars.Count == 0 ? "item" : new string([.. chars]);
    }

    /// <summary>
    /// Saves an entity, retrying with -1, -2, ... when the unique slug index
    /// rejects it. The database constraint is the real guarantee here — a
    /// read-then-write uniqueness check would race under concurrent requests.
    /// </summary>
    public static async Task SaveWithUniqueSlugAsync<T>(
        DbContext db,
        T entity,
        string baseSlug,
        Action<T, string> applySlug,
        CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt <= MaxSuffixAttempts; attempt++)
        {
            applySlug(entity, attempt == 0 ? baseSlug : $"{baseSlug}-{attempt}");

            try
            {
                await db.SaveChangesAsync(cancellationToken);
                return;
            }
            catch (DbUpdateException ex) when (IsSlugConflict(ex))
            {
                // The entity stays tracked in its pending state, so the next
                // iteration retries the same insert/update with a new slug.
            }
        }

        throw new InvalidOperationException(
            $"Could not find a free slug for '{baseSlug}' after {MaxSuffixAttempts} attempts.");
    }

    private static bool IsSlugConflict(DbUpdateException ex) =>
        ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg
        && pg.ConstraintName?.Contains("slug", StringComparison.Ordinal) == true;
}
