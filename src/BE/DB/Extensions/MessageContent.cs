using Chats.BE.DB.Enums;
using OpenAI.Chat;
using System.Text;

namespace Chats.BE.DB;

public partial class MessageContent
{
    public ChatMessageContentPart ToOpenAI()
    {
        return (DBMessageContentType)ContentTypeId switch
        {
            DBMessageContentType.Text => ChatMessageContentPart.CreateTextMessageContentPart(Encoding.Unicode.GetString(Content)),
            DBMessageContentType.ImageUrl => ChatMessageContentPart.CreateImageMessageContentPart(new Uri(Encoding.UTF8.GetString(Content))),
            _ => throw new NotImplementedException()
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
}
