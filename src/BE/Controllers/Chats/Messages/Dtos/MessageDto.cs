using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Messages.Dtos;

public record MessageDto
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("parentId")]
    public required string? ParentId { get; init; }

    [JsonPropertyName("role")]
    public required string Role { get; init; }

    [JsonPropertyName("content")]
    public required MessageContentDto Content { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }
}

public record UserMessageDto : MessageDto;

public record AssistantMessageDto : MessageDto
{
    [JsonPropertyName("inputTokens")]
    public required int InputTokens { get; init; }

    [JsonPropertyName("outputTokens")]
    public required int OutputTokens { get; init; }

    [JsonPropertyName("inputPrice")]
    public required string InputPrice { get; init; }

    [JsonPropertyName("outputPrice")]
    public required string OutputPrice { get; init; }

    [JsonPropertyName("duration")]
    public required int Duration { get; init; }

    [JsonPropertyName("modelName")]
    public required string? ModelName { get; init; }
}

public record MessageContentDto
{
    [JsonPropertyName("text")]
    public required string Text { get; init; }

    [JsonPropertyName("image")]
    public required List<string> Image { get; init; }
}