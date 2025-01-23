using System.Configuration;

namespace Chats.BE.Services.Sessions;

public class JwtKeyManager(IConfiguration configuration)
{
    public string GetOrCreateSecretKey()
    {
        string? secretKey = configuration["JwtSecretKey"];
        if (!string.IsNullOrEmpty(secretKey))
        {
            return secretKey;
        }
        else
        {
            string generated = Guid.NewGuid().ToString();
            configuration["JwtSecretKey"] = generated;
            return generated;
        }
    }
}
