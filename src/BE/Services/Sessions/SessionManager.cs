using Chats.BE.Controllers.Public.AccountLogin.Dtos;
using Chats.BE.DB;
using Chats.BE.Services.OpenAIApiKeySession;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.Sessions;

public class SessionManager(ChatsDB db, SessionCache sessionCache)
{
    public async Task<Guid> RefreshUserSessionId(Guid userId, CancellationToken cancellationToken)
    {
        await db.Sessions.Where(x => x.UserId == userId).ExecuteDeleteAsync(cancellationToken);
        Session session = new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
        };
        db.Sessions.Add(session);
        db.SaveChanges();

        return session.Id;
    }

    public async Task<SessionEntry?> GetUserInfoBySession(Guid sessionId, CancellationToken cancellationToken = default)
    {
        SessionEntry? sessionEntry = await db.Sessions
            .Include(x => x.User)
            .Where(x => x.Id == sessionId)
            .Select(x => new SessionEntry()
            {
                UserId = x.User.Id,
                UserName = x.User.Username,
                Role = x.User.Role,
                Sub = x.User.Sub,
                Provider = x.User.Provider
            })
            .FirstOrDefaultAsync(cancellationToken);
        return sessionEntry;
    }

    public async Task<SessionEntry?> GetCachedUserInfoBySession(Guid sessionId, CancellationToken cancellationToken = default)
    {
        SessionEntry? cached = sessionCache.Get(sessionId);
        if (cached != null)
        {
            return cached;
        }

        SessionEntry? sessionEntry = await GetUserInfoBySession(sessionId, cancellationToken);
        if (sessionEntry != null)
        {
            sessionCache.Set(sessionId, sessionEntry);
        }

        return sessionEntry;
    }

    public async Task<LoginResponse> GenerateSessionForUser(User user, CancellationToken cancellationToken)
    {
        Guid sessionId = await RefreshUserSessionId(user.Id, cancellationToken);
        bool hasPayService = false;
        return new LoginResponse
        {
            SessionId = sessionId,
            UserName = user.Username,
            Role = user.Role,
            CanReCharge = hasPayService,
        };
    }
}
