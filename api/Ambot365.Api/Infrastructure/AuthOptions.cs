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

    /// <summary>
    /// Forces the <c>Secure</c> flag on the session cookie outside development.
    /// Relying on <c>Request.IsHttps</c> alone is fragile: behind a TLS-terminating
    /// proxy the request reaches the app as plain HTTP, and the cookie would be
    /// issued without <c>Secure</c> — sendable over an unencrypted connection.
    /// </summary>
    public required bool RequireSecureCookie { get; init; }

    public static AuthOptions FromConfiguration(IConfiguration configuration, bool isDevelopment)
    {
        var password = configuration["Admin:Password"];
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "No admin password configured. Set Admin:Password in appsettings.json "
                    + "(see docs/DEPLOYMENT.md).");
        }

        var secret = configuration["Admin:JwtSecret"];
        if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 32)
        {
            // HMAC-SHA256 needs at least 256 bits of key material; a short secret
            // would either throw deep inside the token handler or weaken signing.
            throw new InvalidOperationException(
                "Admin:JwtSecret must be set in appsettings.json and be at least 32 bytes "
                    + "(see docs/DEPLOYMENT.md).");
        }

        return new AuthOptions
        {
            Password = password,
            SigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            RequireSecureCookie = !isDevelopment,
        };
    }

    /// <summary>Fixed-time comparison so a wrong password can't be probed byte by byte.</summary>
    public bool PasswordMatches(string? candidate) =>
        !string.IsNullOrEmpty(candidate)
        && CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(candidate),
            Encoding.UTF8.GetBytes(Password));
}
