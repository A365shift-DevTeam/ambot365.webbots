using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Ambot365.Api.Infrastructure;

/// <summary>
/// Admin credentials and signing key, read from configuration. The SPA holds no
/// secret of its own — this is the only credential in the system, and it never
/// leaves the server.
/// </summary>
public sealed class AuthOptions
{
    public const string CookieName = "ambot365_session";
    public static readonly TimeSpan Lifetime = TimeSpan.FromHours(24);

    public required string Password { get; init; }
    public required SymmetricSecurityKey SigningKey { get; init; }

    public static AuthOptions FromConfiguration(IConfiguration configuration)
    {
        var password = configuration["Admin:Password"];
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "No admin password configured. Set Admin__Password (see api/README.md).");
        }

        var secret = configuration["Admin:JwtSecret"];
        if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 32)
        {
            // HMAC-SHA256 needs at least 256 bits of key material; a short secret
            // would either throw deep inside the token handler or weaken signing.
            throw new InvalidOperationException(
                "Admin__JwtSecret must be set and at least 32 bytes (see api/README.md).");
        }

        return new AuthOptions
        {
            Password = password,
            SigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
        };
    }

    /// <summary>Fixed-time comparison so a wrong password can't be probed byte by byte.</summary>
    public bool PasswordMatches(string? candidate) =>
        !string.IsNullOrEmpty(candidate)
        && CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(candidate),
            Encoding.UTF8.GetBytes(Password));
}
