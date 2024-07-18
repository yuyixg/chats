using Chats.BE.Controllers.Chats.Messages.Dtos;
using System.Text.Json;

namespace Chats.BE.Controllers.Chats.Conversations.Dtos;

public record MessageLiteTemp
{
    public required Guid Id { get; init; }
    public required Guid? ParentId { get; init; }
    public required string Role { get; init; }
    public required string Content { get; init; }

    public MessageLiteDto ToDto()
    {
        return new MessageLiteDto
        {
            Id = Id,
            ParentId = ParentId,
            Role = Role,
            Content = JsonSerializer.Deserialize<MessageContentDto>(Content)!
        };
    }
}

public record MessageLiteDto
{
    public required Guid Id { get; init; }
    public required Guid? ParentId { get; init; }
    public required string Role { get; init; }
    public required MessageContentDto Content { get; init; }
}
