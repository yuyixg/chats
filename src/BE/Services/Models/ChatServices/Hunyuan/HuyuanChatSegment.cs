namespace Chats.BE.Services.Models.ChatServices.Hunyuan;

using System.Text.Json.Serialization;

public record HuyuanChatSegment
{
    [JsonPropertyName("Note")]
    public required string Note { get; init; }

    [JsonPropertyName("Choices")]
    public required List<HunyuanChoice> Choices { get; init; }

    [JsonPropertyName("Created"), JsonConverter(typeof(UnixDateTimeOffsetConverter))]
    public required DateTimeOffset Created { get; init; }

    [JsonPropertyName("Id")]
    public required string Id { get; init; }

    [JsonPropertyName("Usage")]
    public required HunyuanUsage Usage { get; init; }
}

public record HunyuanChoice
{
    [JsonPropertyName("Delta")]
    public required HunyuanDelta Delta { get; init; }

    [JsonPropertyName("FinishReason")]
    public required string FinishReason { get; init; }
}

public record HunyuanDelta
{
    [JsonPropertyName("Role")]
    public required string Role { get; init; }

    [JsonPropertyName("Content")]
    public required string Content { get; init; }
}

public record HunyuanUsage
{
    [JsonPropertyName("PromptTokens")]
    public required int PromptTokens { get; init; }

    [JsonPropertyName("CompletionTokens")]
    public required int CompletionTokens { get; init; }

    [JsonPropertyName("TotalTokens")]
    public required int TotalTokens { get; init; }
}