using Chats.BE.DB.Enums;
using Chats.BE.Services.Conversations;
using OpenAI.Chat;
using System.Text;

namespace Chats.BE.Controllers.Chats.Conversations.Dtos;

public record MessageLiteDto
{
    public required long Id { get; init; }
    public required long? ParentId { get; init; }
    public required DBConversationRole Role { get; init; }
    public required DBMessageSegment[] Content { get; init; }

    public ChatMessage ToOpenAI()
    {
        return Role switch
        {
            DBConversationRole.System => Content[0].ToOpenAISystemChatMessage(),
            DBConversationRole.User => new UserChatMessage(Content.Select(c => c.ToOpenAI())),
            DBConversationRole.Assistant => new AssistantChatMessage(Content.Where(x => x.ContentType != DBMessageContentType.Error).Select(x => x.ToOpenAI())),
            _ => throw new NotImplementedException()
        };
    }
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

    public SystemChatMessage ToOpenAISystemChatMessage()
    {
        return new SystemChatMessage(Encoding.Unicode.GetString(Content));
    }
}
