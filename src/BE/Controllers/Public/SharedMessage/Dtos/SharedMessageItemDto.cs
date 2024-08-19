using Chats.BE.Controllers.Chats.Messages.Dtos;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.PublicMessage.Dtos;

public record SharedMessageItemDto
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("parentId")]
    public Guid? ParentId { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }

    [JsonPropertyName("inputTokens")]
    public required int InputTokens { get; init; }

    [JsonPropertyName("outputTokens")]
    public required int OutputTokens { get; init; }

    [JsonPropertyName("inputPrice")]
    public required string InputPrice { get; init; }

    [JsonPropertyName("outputPrice")]
    public required string OutputPrice { get; init; }

    [JsonPropertyName("role")]
    public required string Role { get; init; }

    [JsonPropertyName("content")]
    public required MessageContentDto Content { get; init; }

    [JsonPropertyName("duration")]
    public required int Duration { get; init; }

    [JsonPropertyName("childrenIds")]
    public required List<Guid> ChildrenIds { get; init; }

    [JsonPropertyName("assistantChildrenIds")]
    public required List<Guid> AssistantChildrenIds { get; init; }
}
