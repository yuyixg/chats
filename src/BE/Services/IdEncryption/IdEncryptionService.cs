using Microsoft.AspNetCore.WebUtilities;
using System.Security.Cryptography;

namespace Chats.BE.Services.IdEncryption;

/// <summary>
/// Service for encrypting and decrypting IDs using AES encryption.
/// The encrypted data is structured as base64url([1:version + encryptedData])
/// </summary>
public class IdEncryptionService : IIdEncryptionService
{
    private readonly byte[] _idHasherKey;
    private readonly byte[] _iv = new byte[16]; // Use a fixed IV for simplicity

    public IdEncryptionService(string idHasherPassword)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(idHasherPassword, nameof(idHasherPassword));

        // Parameters for PBKDF2
        byte[] salt = new byte[16];
        const int iterations = 200; // not too high to keep it fast, not a user password here

        using Rfc2898DeriveBytes rfc2898DeriveBytes = new(idHasherPassword, salt, iterations, HashAlgorithmName.SHA256);
        _idHasherKey = rfc2898DeriveBytes.GetBytes(32); // 256 bits = 32 bytes
    }

    public string Encrypt(int id) => Encrypt(BitConverter.GetBytes(id));
    public string Encrypt(long id) => Encrypt(BitConverter.GetBytes(id));

    private string Encrypt(ReadOnlySpan<byte> input)
    {
        using Aes aes = Aes.Create();
        aes.Key = _idHasherKey;

        byte[] encryptedIdBytes = aes.EncryptCbc(input, _iv);

        byte[] encryptedIdBytesWithIV = new byte[1 + encryptedIdBytes.Length];
        encryptedIdBytesWithIV[0] = 0; // Version
        Array.Copy(encryptedIdBytes, 0, encryptedIdBytesWithIV, 1, encryptedIdBytes.Length);

        return WebEncoders.Base64UrlEncode(encryptedIdBytesWithIV);
    }

    private byte[] Decrypt(string encrypted)
    {
        byte[] encryptedIdBytesWithIV = WebEncoders.Base64UrlDecode(encrypted);

        if (encryptedIdBytesWithIV[0] == 0) // Version 0
        {
            if (encryptedIdBytesWithIV.Length != 1 + 16)
            {
                throw new InvalidOperationException("Invalid encrypted ID length.");
            }

            byte[] encryptedIdBytes = new byte[encryptedIdBytesWithIV.Length - 1];
            Array.Copy(encryptedIdBytesWithIV, 1, encryptedIdBytes, 0, encryptedIdBytes.Length);

            using Aes aes = Aes.Create();
            aes.Key = _idHasherKey;
            byte[] decryptedIdBytes = aes.DecryptCbc(encryptedIdBytes, _iv);

            return decryptedIdBytes;
        }
        else
        {
            throw new InvalidOperationException($"Unsupported version: {encryptedIdBytesWithIV[0]}");
        }
    }

    public int DecryptAsInt32(string encrypted) => BitConverter.ToInt32(Decrypt(encrypted));
    public long DecryptAsInt64(string encrypted) => BitConverter.ToInt64(Decrypt(encrypted));
}
