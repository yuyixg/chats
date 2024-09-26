namespace Chats.BE.Services.IdEncryption;

public interface IIdEncryptionService
{
    int DecryptAsInt32(string encrypted);
    long DecryptAsInt64(string encrypted);
    string Encrypt(int id);
    string Encrypt(long id);
}