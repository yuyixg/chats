
namespace Chats.BE.Services.IdEncryption;

public class IdEncryptionFactory(ILogger<IdEncryptionFactory> logger, IConfiguration configuration)
{
    public IIdEncryptionService Create()
    {
        string? idHasherPassword = configuration["ID_ENCRYPTION_PASSWORD"];
        if (string.IsNullOrWhiteSpace(idHasherPassword))
        {
            logger.LogWarning("ID_ENCRYPTION_PASSWORD is not set, using NoOpIdEncryptionService");
            return new NoOpIdEncryptionService();
        }
        else
        {
            return new IdEncryptionService(idHasherPassword);
        }
    }
}
