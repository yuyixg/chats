namespace Chats.BE.Services.Sessions;

public class JwtKeyManager
{
    public string GetOrCreateSecretKey()
    {
        string? secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
        if (secretKey != null)
        {
            return secretKey;
        }
        else
        {
            string generated = Guid.NewGuid().ToString();
            Environment.SetEnvironmentVariable("JWT_SECRET_KEY", generated);
            return generated;
        }
    }
}
