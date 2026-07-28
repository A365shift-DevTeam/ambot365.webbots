using System.Security.Cryptography;
using System.Text;

namespace Ambot365.Api.Infrastructure;

/// <summary>
/// The browser never reaches this API. Next.js route handlers authenticate the
/// admin with their existing session cookie (src/lib/auth.ts) and then call here
/// server-to-server with a shared key, so this is the only credential the API
/// needs to understand — no CORS, no cookie parsing, no JWT secret sharing.
/// </summary>
public class ApiKeyMiddleware(RequestDelegate next, string apiKey)
{
    public const string HeaderName = "X-API-Key";

    private readonly byte[] _expected = Encoding.UTF8.GetBytes(apiKey);

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.TryGetValue(HeaderName, out var provided) || !Matches(provided!))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { success = false, error = "Invalid or missing API key" });
            return;
        }

        await next(context);
    }

    private bool Matches(string? provided)
    {
        if (string.IsNullOrEmpty(provided))
        {
            return false;
        }

        // Fixed-time comparison so a wrong key can't be discovered byte by byte.
        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(provided), _expected);
    }
}
