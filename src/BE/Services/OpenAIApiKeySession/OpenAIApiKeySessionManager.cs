using Chats.BE.DB;
using Chats.BE.Services.Sessions;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.OpenAIApiKeySession;

public class OpenAIApiKeySessionManager(ChatsDB db, OpenAIApiKeySessionCache sessionCache)
{
    public async Task<SessionEntry?> GetUserInfoByOpenAIApiKey(string apiKey, CancellationToken cancellationToken = default)
    {
        SessionEntry? sessionEntry = await db.ApiKeys
            .Include(x => x.User)
            .Include(x => x.Models)
            .Where(x => x.Key == apiKey)
            .Select(x => new SessionEntry()
            {
                UserId = x.User.Id,
                UserName = x.User.Username,
                Role = x.User.Role,
                Sub = x.User.Sub,
                Provider = x.User.Provider,
            })
            .FirstOrDefaultAsync(cancellationToken);
        return sessionEntry;
    }

    public async Task<SessionEntry?> GetCachedUserInfoByApiKey(string apiKey, CancellationToken cancellationToken = default)
    {
        SessionEntry? cached = sessionCache.Get(apiKey);
        if (cached != null)
        {
            return cached;
        }

        SessionEntry? sessionEntry = await GetUserInfoByOpenAIApiKey(apiKey, cancellationToken);
        if (sessionEntry != null)
        {
            sessionCache.Set(apiKey, sessionEntry);
        }

        return sessionEntry;
    }
}
