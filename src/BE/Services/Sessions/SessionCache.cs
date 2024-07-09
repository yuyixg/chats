using System.Runtime.Caching;

namespace Chats.BE.Services.Sessions;

public class SessionCache
{
    private readonly MemoryCache _cache = new(nameof(SessionCache));
    public TimeSpan CacheDuration { get; } = TimeSpan.FromMinutes(1);

    public void Set(Guid sessionId, SessionEntry sessionEntry)
    {
        _cache.Set(sessionId.ToString(), sessionEntry, DateTimeOffset.Now.Add(CacheDuration));
    }

    public SessionEntry? Get(Guid sessionId)
    {
        return (SessionEntry?)_cache.Get(sessionId.ToString());
    }
}
