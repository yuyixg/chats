using Chats.BE.DB;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.UserChats.Dtos;

public record ChatsResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("title")]
    public required string Title { get; init; }

    [JsonPropertyName("isTopMost")]
    public required bool IsTopMost { get; init; }

    [JsonPropertyName("spans")]
    public required ChatSpanDto[] Spans { get; init; }

    [JsonPropertyName("groupId")]
    public required string? GroupId { get; init; }

    [JsonPropertyName("tags")]
    public required string[] Tags { get; init; }

    [JsonPropertyName("leafMessageId")]
    public required string? LeafMessageId { get; init; }

    [JsonPropertyName("updatedAt")]
    public required DateTime UpdatedAt { get; init; }
}

public record ChatSpanDto
{
    [JsonPropertyName("spanId")]
    public required byte SpanId { get; init; }

    [JsonPropertyName("modelId")]
    public required int ModelId { get; init; }

    [JsonPropertyName("modelName")]
    public required string ModelName { get; init; }

    [JsonPropertyName("modelProviderId")]
    public required short ModelProviderId { get; init; }

    [JsonPropertyName("temperature")]
    public required float? Temperature { get; init; }

    [JsonPropertyName("enableSearch")]
    public required bool EnableSearch { get; init; }

    public static ChatSpanDto FromDB(ChatSpan span) => new()
    {
        SpanId = span.SpanId,
        ModelId = span.ModelId,
        ModelName = span.Model.Name,
        ModelProviderId = span.Model.ModelKey.ModelProviderId,
        Temperature = span.Temperature,
        EnableSearch = span.EnableSearch,
    };
}