using Chats.BE.Services.Sessions;
using System.Runtime.Caching;

namespace Chats.BE.Services.OpenAIApiKeySession;

public class OpenAIApiKeySessionCache
{
    private readonly MemoryCache _cache = new(nameof(OpenAIApiKeySessionCache));
    public TimeSpan CacheDuration { get; } = TimeSpan.FromMinutes(1);

    public void Set(string apiKey, SessionEntry sessionEntry)
    {
        _cache.Set(apiKey, sessionEntry, DateTimeOffset.Now.Add(CacheDuration));
    }

    public SessionEntry? Get(string apiKey)
    {
        return (SessionEntry?)_cache.Get(apiKey);
    }
}
