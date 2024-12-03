using Microsoft.AspNetCore.WebUtilities;
using System.Security.Cryptography;

namespace Chats.BE.Services.UrlEncryption;

internal class Utils
{
    public static byte[] GenerateIdHasherKey(string idHasherPassword, int keyLength, int iterations)
    {
        // Parameters for PBKDF2
        byte[] salt = new byte[16];
        using Rfc2898DeriveBytes rfc2898DeriveBytes = new(idHasherPassword, salt, iterations, HashAlgorithmName.SHA256);
        return rfc2898DeriveBytes.GetBytes(keyLength);
    }

    internal static string SignData(byte[] cleanBytes, byte[] key)
    {
        byte[] output = HMACSHA256.HashData(key, cleanBytes);
        return WebEncoders.Base64UrlEncode(output);
    }

    /// <summary>
    /// The encrypted data is structured as base64url([1:version + encryptedData])
    /// </summary>
    public static string Encrypt(ReadOnlySpan<byte> input, byte[] key, byte[] iv)
    {
        using Aes aes = Aes.Create();
        aes.Key = key;

        byte[] encryptedIdBytes = aes.EncryptCbc(input, iv);

        byte[] encryptedIdBytesWithIV = new byte[1 + encryptedIdBytes.Length];
        encryptedIdBytesWithIV[0] = 0; // Version
        Array.Copy(encryptedIdBytes, 0, encryptedIdBytesWithIV, 1, encryptedIdBytes.Length);

        return WebEncoders.Base64UrlEncode(encryptedIdBytesWithIV);
    }

    public static byte[] Decrypt(string encrypted, byte[] key, byte[] iv)
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
            aes.Key = key;
            byte[] decryptedIdBytes = aes.DecryptCbc(encryptedIdBytes, iv);

            return decryptedIdBytes;
        }
        else
        {
            throw new InvalidOperationException($"Unsupported version: {encryptedIdBytesWithIV[0]}");
        }
    }
}
