using Chats.BE.Services.OpenAIApiKeySession;
using Chats.BE.Services.Sessions;
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
        if (!Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
        {
            return AuthenticateResult.NoResult();
        }

        string authorizationHeaderString = authorizationHeader.ToString();
        string apiKey = authorizationHeaderString.Split(' ').Last();

        SessionEntry? userInfo = await sessionManager.GetCachedUserInfoByApiKey(apiKey);

        if (userInfo == null)
        {
            return AuthenticateResult.Fail($"Invalid API Key: {apiKey}");
        }

        List<Claim> claims = userInfo.ToClaims();
        claims.Add(new Claim("api-key", apiKey));
        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}