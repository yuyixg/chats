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

    [JsonPropertyName("isCollapsed")]
    public required bool IsCollapsed { get; init; }
}

public record CreateChatGroupRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("rank")]
    public required short Rank { get; init; }

    [JsonPropertyName("isCollapsed")]
    public required bool IsCollapsed { get; init; }
}