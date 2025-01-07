using Chats.BE.Controllers.Common.Dtos;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.UserChats.Dtos;

public record ChatGroupDto
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("rank")]
    public required short Rank { get; init; }

    [JsonPropertyName("isExpanded")]
    public required bool IsExpanded { get; init; }
}

public record ChatGroupDtoWithMessage : ChatGroupDto
{
    [JsonPropertyName("messages")]
    public PagedResult<ChatsResponse> Messages { get; set; } = null!;
}

public record CreateChatGroupRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("rank")]
    public required short Rank { get; init; }

    [JsonPropertyName("isExpanded")]
    public required bool IsExpanded { get; init; }
}