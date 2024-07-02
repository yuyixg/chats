using Chats.BE.DB;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using System.Security.Claims;

namespace Chats.BE.Infrastructure;

public class SessionAuthenticationMiddleware(RequestDelegate _next)
{
    public async Task InvokeAsync(HttpContext context, ChatsDB db, ILogger<SessionAuthenticationMiddleware> logger)
    {
        if (context.Request.Headers.TryGetValue("Authorization", out StringValues authorizationHeader))
        {
            string authorizationHeaderString = authorizationHeader.ToString();
            if (!Guid.TryParse(authorizationHeaderString.Split(' ').Last(), out Guid sessionId))
            {
                logger.LogWarning("Invalid session id: {AuthorizationHeader}", authorizationHeaderString);
            }
            else
            {
                var userInfo = db.Sessions
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
                    .FirstOrDefault();
                if (userInfo == null)
                {
                    logger.LogWarning("Session not found: {SessionId}", sessionId);
                }
                else
                {
                    ClaimsIdentity identity = new(
                    [
                        new Claim(ClaimTypes.NameIdentifier, userInfo.Id.ToString()),
                        new Claim(ClaimTypes.Name, userInfo.UserName),
                        new Claim(ClaimTypes.Role, userInfo.Role),
                        new Claim("provider", userInfo.Provider!),
                        new Claim("provider-sub", userInfo.Sub!),
                    ], "Bearer");
                    context.User = new ClaimsPrincipal(identity);
                }
            }
        }

        await _next(context);
    }
}
