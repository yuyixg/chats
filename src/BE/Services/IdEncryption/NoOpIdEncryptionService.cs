namespace Chats.BE.Services.IdEncryption;

public class NoOpIdEncryptionService : IIdEncryptionService
{
    public int DecryptAsInt32(string encrypted) => int.Parse(encrypted);

    public long DecryptAsInt64(string encrypted) => long.Parse(encrypted);

    public string Encrypt(int id) => id.ToString();

    public string Encrypt(long id) => id.ToString();
}