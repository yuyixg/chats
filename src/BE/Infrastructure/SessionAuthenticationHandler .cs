using Chats.BE.DB;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace Chats.BE.Infrastructure;

public class SessionAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory loggerFactory,
    UrlEncoder encoder,
    ChatsDB db) : AuthenticationHandler<AuthenticationSchemeOptions>(options, loggerFactory, encoder)
{
    private readonly ILogger<SessionAuthenticationHandler> _logger = loggerFactory.CreateLogger<SessionAuthenticationHandler>();

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
        {
            return AuthenticateResult.NoResult();
        }

        string authorizationHeaderString = authorizationHeader.ToString();
        if (!Guid.TryParse(authorizationHeaderString.Split(' ').Last(), out Guid sessionId))
        {
            _logger.LogWarning("Invalid session id: {AuthorizationHeader}", authorizationHeaderString);
            return AuthenticateResult.Fail("Invalid session id.");
        }

        var userInfo = await db.Sessions
            .Include(x => x.User)
            .Where(x => x.Id == sessionId)
            .Select(x => new
            {
                x.User.Id,
                UserName = x.User.Username,
                x.User.Role,
                x.User.Sub,
                x.User.Provider
            })
            .FirstOrDefaultAsync();

        if (userInfo == null)
        {
            _logger.LogWarning("Session not found: {SessionId}", sessionId);
            return AuthenticateResult.Fail("Session not found.");
        }

        List<Claim> claims = 
        [
            new Claim(ClaimTypes.NameIdentifier, userInfo.Id.ToString()),
            new Claim(ClaimTypes.Name, userInfo.UserName),
            new Claim(ClaimTypes.Role, userInfo.Role)
        ];

        if (userInfo.Provider != null)
        {
            claims.Add(new Claim("provider", userInfo.Provider));
        }

        if (userInfo.Sub != null)
        {
            claims.Add(new Claim("provider-sub", userInfo.Sub));
        }

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}