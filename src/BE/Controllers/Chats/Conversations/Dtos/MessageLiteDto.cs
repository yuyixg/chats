using Chats.BE.DB.Enums;
using Chats.BE.Services.Conversations;
using OpenAI.Chat;
using System.Diagnostics;
using System.Text;

namespace Chats.BE.Controllers.Chats.Conversations.Dtos;

public record MessageLiteDto
{
    public required long Id { get; init; }
    public required long? ParentId { get; init; }
    public required DBChatRole Role { get; init; }
    public required DBMessageSegment[] Content { get; init; }

    public ChatMessage ToOpenAI()
    {
        return Role switch
        {
            DBChatRole.System => new SystemChatMessage(Content[0].ToString()),
            DBChatRole.User => new UserChatMessage(Content.Select(c => c.ToOpenAI())),
            DBChatRole.Assistant => new AssistantChatMessage(Content.Where(x => x.ContentType != DBMessageContentType.Error).Select(x => x.ToOpenAI())),
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
            DBMessageContentType.Text => ChatMessageContentPart.CreateTextPart(ToString()),
            DBMessageContentType.ImageUrl => ChatMessageContentPart.CreateImagePart(new Uri(ToString())),
            _ => throw new NotImplementedException()
        };
    }

    public override string ToString()
    {
        return ContentType switch
        {
            DBMessageContentType.Text => Encoding.Unicode.GetString(Content),
            DBMessageContentType.ImageUrl => Encoding.UTF8.GetString(Content),
            DBMessageContentType.Error => Encoding.UTF8.GetString(Content),
            _ => throw new NotImplementedException()
        };
    }
}
