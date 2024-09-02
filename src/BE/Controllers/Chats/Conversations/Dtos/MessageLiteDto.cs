using Chats.BE.DB.Enums;
using Chats.BE.Services.Conversations;
using OpenAI.Chat;
using System.Text;

namespace Chats.BE.Controllers.Chats.Conversations.Dtos;

public record MessageLiteDto
{
    public required long Id { get; init; }
    public required long? ParentId { get; init; }
    public required DBConversationRoles Role { get; init; }
    public required DBMessageSegment[] Content { get; init; }
}

public record DBMessageSegment
{
    public required DBMessageContentType ContentType { get; init; }

    public required byte[] Content { get; init; }

    public ChatMessageContentPart ToOpenAI()
    {
        return ContentType switch
        {
            DBMessageContentType.Text => ChatMessageContentPart.CreateTextMessageContentPart(Encoding.Unicode.GetString(Content)),
            DBMessageContentType.ImageUrl => ChatMessageContentPart.CreateImageMessageContentPart(new Uri(Encoding.UTF8.GetString(Content))),
            _ => throw new NotImplementedException()
        };
    }
}
