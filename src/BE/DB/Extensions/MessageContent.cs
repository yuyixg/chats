using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.DB.Enums;
using Chats.BE.Services.IdEncryption;
using OpenAI.Chat;
using System.Buffers.Binary;
using System.Text;

namespace Chats.BE.DB;

public partial class MessageContent
{
    public ChatMessageContentPart ToOpenAI()
    {
        return (DBMessageContentType)ContentTypeId switch
        {
            DBMessageContentType.Text => ChatMessageContentPart.CreateTextPart(Encoding.Unicode.GetString(Content)),
            DBMessageContentType.ImageUrl => ChatMessageContentPart.CreateImagePart(new Uri(Encoding.UTF8.GetString(Content))),
            _ => throw new NotImplementedException()
        };
    }

    public DBMessageSegment ToSegment()
    {
        return new DBMessageSegment
        {
            ContentType = (DBMessageContentType)ContentTypeId,
            Content = Content
        };
    }

    public static MessageContent FromText(string text)
    {
        return new MessageContent { Content = Encoding.Unicode.GetBytes(text), ContentTypeId = (byte)DBMessageContentType.Text };
    }

    public static MessageContent FromImageUrl(string imageUrl)
    {
        return new MessageContent { Content = Encoding.UTF8.GetBytes(imageUrl), ContentTypeId = (byte)DBMessageContentType.ImageUrl };
    }

    public static MessageContent FromError(string error)
    {
        return new MessageContent { Content = Encoding.UTF8.GetBytes(error), ContentTypeId = (byte)DBMessageContentType.Error };
    }

    public static MessageContent FromFileId(string fileId, IIdEncryptionService idEncryptionService)
    {
        byte[] bytes = new byte[4];
        BinaryPrimitives.WriteInt32LittleEndian(bytes, idEncryptionService.DecryptAsInt32(fileId));
        return new MessageContent { Content = bytes, ContentTypeId = (byte)DBMessageContentType.FileId };
    }
}
