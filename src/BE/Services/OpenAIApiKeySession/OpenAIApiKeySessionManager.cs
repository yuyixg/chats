using Chats.BE.DB;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.OpenAIApiKeySession;

public class OpenAIApiKeySessionManager(ChatsDB db)
{
    public async Task<ApiKeyEntry?> GetUserInfoByOpenAIApiKey(string apiKey, CancellationToken cancellationToken = default)
    {
        ApiKeyEntry? sessionEntry = await db.UserApiKeys
            .Include(x => x.User)
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
}
