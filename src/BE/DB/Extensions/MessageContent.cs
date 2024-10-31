using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.DB.Enums;
using OpenAI.Chat;
using System.Text;

namespace Chats.BE.DB;

public partial class MessageContent2
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

    public static MessageContent2 FromText(string text)
    {
        return new MessageContent2 { Content = Encoding.Unicode.GetBytes(text), ContentTypeId = (byte)DBMessageContentType.Text };
    }

    public static MessageContent2 FromImageUrl(string imageUrl)
    {
        return new MessageContent2 { Content = Encoding.UTF8.GetBytes(imageUrl), ContentTypeId = (byte)DBMessageContentType.ImageUrl };
    }

    public static MessageContent2 FromError(string error)
    {
        return new MessageContent2 { Content = Encoding.UTF8.GetBytes(error), ContentTypeId = (byte)DBMessageContentType.Error };
    }
}
