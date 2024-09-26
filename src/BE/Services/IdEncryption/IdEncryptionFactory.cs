
namespace Chats.BE.Services.IdEncryption;

public class IdEncryptionFactory(ILogger<IdEncryptionFactory> logger, IConfiguration configuration)
{
    public IIdEncryptionService Create()
    {
        string? idHasherPassword = configuration["ID_HASHER_PASSWORD"];
        if (idHasherPassword == null)
        {
            logger.LogWarning("ID_HASHER_PASSWORD is not set, using NoOpIdEncryptionService");
            return new NoOpIdEncryptionService();
        }
        else
        {
            return new IdEncryptionService(idHasherPassword);
        }
    }
}
