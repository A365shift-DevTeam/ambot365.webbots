using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Ambot365.Api.Infrastructure;
using Microsoft.IdentityModel.Tokens;

namespace Ambot365.Api.Endpoints;

public record LoginRequest(string? Password);

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app, AuthOptions auth)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", (LoginRequest request, HttpContext context) =>
        {
            if (!auth.PasswordMatches(request.Password))
            {
                return Results.Json(
                    new { success = false, error = "Incorrect password" },
                    statusCode: StatusCodes.Status401Unauthorized);
            }

            context.Response.Cookies.Append(AuthOptions.CookieName, IssueToken(auth), new CookieOptions
            {
                // httpOnly is the whole point: the SPA never reads this value, so
                // an XSS bug cannot exfiltrate the session the way it could a
                // token kept in localStorage.
                HttpOnly = true,
                Secure = auth.RequireSecureCookie || context.Request.IsHttps,
                // demo.ambot365.com and demoapi.ambot365.com share the registrable
                // domain ambot365.com, so requests between them are same-site even
                // though they are cross-origin. Lax is therefore sufficient, and
                // avoids exposing the session cookie to genuine cross-site sends
                // the way SameSite=None would.
                SameSite = SameSiteMode.Lax,
                Path = "/",
                MaxAge = AuthOptions.Lifetime,
            });

            return Results.Ok(new { success = true });
        });

        group.MapPost("/logout", (HttpContext context) =>
        {
            context.Response.Cookies.Delete(AuthOptions.CookieName, new CookieOptions { Path = "/" });
            return Results.Ok(new { success = true });
        });

        // Lets the SPA restore admin state on reload without ever seeing the token.
        group.MapGet("/me", (HttpContext context) =>
            Results.Ok(new { authenticated = context.User.Identity?.IsAuthenticated == true }));
    }

    private static string IssueToken(AuthOptions auth)
    {
        var token = new JwtSecurityToken(
            claims: [new Claim(ClaimTypes.Role, "admin"), new Claim(ClaimTypes.Name, "admin")],
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.Add(AuthOptions.Lifetime),
            signingCredentials: new SigningCredentials(auth.SigningKey, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
