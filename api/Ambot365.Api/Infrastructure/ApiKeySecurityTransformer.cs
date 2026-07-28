using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

namespace Ambot365.Api.Infrastructure;

/// <summary>
/// Declares the X-API-Key scheme in the OpenAPI document so Swagger UI shows an
/// "Authorize" button. Without this every Try-it-out request comes back 401,
/// because the UI has no other way to learn the API needs a header.
/// </summary>
public sealed class ApiKeySecurityTransformer : IOpenApiDocumentTransformer
{
    private const string SchemeId = "ApiKey";

    public Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Info.Title = "AMBOT 365 Catalog API";
        document.Info.Description =
            "Bots and demo websites for the AMBOT 365 showcase site. "
            + "Click Authorize and paste the value of Api:Key from appsettings.Development.json.";

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes[SchemeId] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.ApiKey,
            In = ParameterLocation.Header,
            Name = ApiKeyMiddleware.HeaderName,
            Description = "Must match Api:Key in the .NET app settings.",
        };

        document.SecurityRequirements.Add(new OpenApiSecurityRequirement
        {
            [new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = SchemeId },
            }] = [],
        });

        return Task.CompletedTask;
    }
}
