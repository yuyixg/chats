using Chats.BE.Services.OpenAIApiKeySession;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace Chats.BE.Infrastructure;

public class OpenAIApiKeyAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory loggerFactory,
    OpenAIApiKeySessionManager sessionManager,
    UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, loggerFactory, encoder)
{
    private readonly ILogger<SessionAuthenticationHandler> _logger = loggerFactory.CreateLogger<SessionAuthenticationHandler>();

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out Microsoft.Extensions.Primitives.StringValues authorizationHeader))
        {
            return AuthenticateResult.NoResult();
        }

        string authorizationHeaderString = authorizationHeader.ToString();
        string apiKey = authorizationHeaderString.Split(' ').Last();

        ApiKeyEntry? userInfo = await sessionManager.GetCachedUserInfoByApiKey(apiKey);

        if (userInfo == null)
        {
            return AuthenticateResult.Fail($"Invalid API Key: {apiKey}");
        }

        if (userInfo.IsExpired)
        {
            return AuthenticateResult.Fail($"API Key expired: {apiKey}");
        }

        ClaimsIdentity identity = new(userInfo.ToClaims(), Scheme.Name);
        ClaimsPrincipal principal = new(identity);
        AuthenticationTicket ticket = new(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}