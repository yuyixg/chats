using Chats.BE.DB;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.OpenAIApiKeySession;

public class OpenAIApiKeySessionManager(ChatsDB db, OpenAIApiKeySessionCache sessionCache)
{
    public async Task<ApiKeyEntry?> GetUserInfoByOpenAIApiKey(string apiKey, CancellationToken cancellationToken = default)
    {
        ApiKeyEntry? sessionEntry = await db.ApiKeys
            .Include(x => x.User)
            .Include(x => x.Models)
            .Where(x => x.Key == apiKey && !x.IsDeleted)
            .Select(x => new ApiKeyEntry()
            {
                UserId = x.User.Id,
                UserName = x.User.Username,
                Role = x.User.Role,
                Sub = x.User.Sub,
                Provider = x.User.Provider,
                ApiKey = apiKey,
                ApiKeyId = x.Id,
                Expires = x.Expires
            })
            .FirstOrDefaultAsync(cancellationToken);
        return sessionEntry;
    }

    public async Task<ApiKeyEntry?> GetCachedUserInfoByApiKey(string apiKey, CancellationToken cancellationToken = default)
    {
        ApiKeyEntry? cached = sessionCache.Get(apiKey);
        if (cached != null)
        {
            return cached;
        }

        ApiKeyEntry? sessionEntry = await GetUserInfoByOpenAIApiKey(apiKey, cancellationToken);
        if (sessionEntry != null)
        {
            sessionCache.Set(apiKey, sessionEntry);
        }

        return sessionEntry;
    }
}
