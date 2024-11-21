using Chats.BE.DB;
using Chats.BE.Services.Sessions;

namespace Chats.BE.Services.Init;

public class InitService(IServiceScopeFactory scopeFactory)
{
    public async Task Init(CancellationToken cancellationToken = default)
    {
        using IServiceScope scope = scopeFactory.CreateScope();
        using ChatsDB db = scope.ServiceProvider.GetRequiredService<ChatsDB>();

        await db.Database.EnsureCreatedAsync(cancellationToken);

        JwtKeyManager jwtKeyManager = scope.ServiceProvider.GetRequiredService<JwtKeyManager>();
        await jwtKeyManager.GetOrCreateSecretKey(cancellationToken);
    }
}
