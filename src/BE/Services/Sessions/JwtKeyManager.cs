using System.Configuration;

namespace Chats.BE.Services.Sessions;

public class JwtKeyManager(IConfiguration configuration)
{
    public string GetOrCreateSecretKey()
    {
        string? secretKey = configuration["JWT_SECRET_KEY"];
        if (secretKey != null)
        {
            return secretKey;
        }
        else
        {
            string generated = Guid.NewGuid().ToString();
            configuration["JWT_SECRET_KEY"] = generated;
            return generated;
        }
    }
}
