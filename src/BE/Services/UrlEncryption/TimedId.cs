using System.Buffers.Binary;

namespace Chats.BE.Services.UrlEncryption;

public record TimedId(int Id, DateTimeOffset ValidBefore)
{
    public static TimedId Create2Hours(int id)
    {
        return new TimedId(id, DateTimeOffset.UtcNow.AddHours(2));
    }

    public byte[] Serialize()
    {
        byte[] bytes = new byte[4 + 8];
        BinaryPrimitives.WriteInt32LittleEndian(bytes, Id);
        BinaryPrimitives.WriteInt64LittleEndian(bytes.AsSpan(4), ValidBefore.ToUnixTimeMilliseconds());
        return bytes;
    }
}
