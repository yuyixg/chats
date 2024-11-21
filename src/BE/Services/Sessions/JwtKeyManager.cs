using Chats.BE.DB;
using Chats.BE.Services.Configs;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.Sessions;

public class JwtKeyManager(ChatsDB db)
{
    public async Task<string> GetOrCreateSecretKey(CancellationToken cancellationToken)
    {
        // check environment variable first
        // if it's not set, then generate a new one and store into database
        string? secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
        if (secretKey != null) return secretKey;

        string? configText = await db.Configs
            .Where(s => s.Key == DBConfigKey.JwtSecretKey)
            .Select(x => x.Value)
            .SingleOrDefaultAsync(cancellationToken);
        if (configText != null) return configText;

        string generated = Guid.NewGuid().ToString();
        db.Configs.Add(new Config { Key = DBConfigKey.JwtSecretKey, Value = generated, Description = $"Generated at {DateTime.Now:O}" });
        await db.SaveChangesAsync(cancellationToken);

        return generated;
    }
}
