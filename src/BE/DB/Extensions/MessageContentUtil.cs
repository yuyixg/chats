using System.Text;

namespace Chats.BE.DB.Extensions;

public static class MessageContentUtil
{
    public static string ReadText(byte[] content)
    {
        return Encoding.Unicode.GetString(content);
    }

    public static byte[] WriteText(string text)
    {
        return Encoding.Unicode.GetBytes(text);
    }

    public static string ReadError(byte[] content)
    {
        return Encoding.UTF8.GetString(content);
    }

    public static byte[] WriteError(string error)
    {
        return Encoding.UTF8.GetBytes(error);
    }

    public static int ReadFileId(byte[] content)
    {
        return BitConverter.ToInt32(content);
    }

    public static byte[] WriteFileId(int fileId)
    {
        return BitConverter.GetBytes(fileId);
    }
}
