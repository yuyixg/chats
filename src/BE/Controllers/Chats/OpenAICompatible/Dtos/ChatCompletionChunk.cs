using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.OpenAICompatible.Dtos;

public record Delta
{
    [JsonPropertyName("content")]
    public required string Content { get; init; }
}

public record Choice
{
    [JsonPropertyName("index")]
    public required int Index { get; init; }

    [JsonPropertyName("delta")]
    public required Delta Delta { get; init; }

    [JsonPropertyName("logprobs")]
    public object? Logprobs { get; init; }

    [JsonPropertyName("finish_reason")]
    public string? FinishReason { get; init; }
}

public record Usage
{
    [JsonPropertyName("prompt_tokens")]
    public required int PromptTokens { get; init; }

    [JsonPropertyName("completion_tokens")]
    public required int CompletionTokens { get; init; }

    [JsonPropertyName("total_tokens")]
    public required int TotalTokens { get; init; }
}

public record ChatCompletionChunk
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("object")]
    public required string Object { get; init; }

    [JsonPropertyName("created")]
    public required long Created { get; init; }

    [JsonPropertyName("model")]
    public required string Model { get; init; }

    [JsonPropertyName("system_fingerprint")]
    public required string SystemFingerprint { get; init; }

    [JsonPropertyName("choices")]
    public required List<Choice> Choices { get; init; }

    [JsonPropertyName("usage")]
    public Usage? Usage { get; init; }
}