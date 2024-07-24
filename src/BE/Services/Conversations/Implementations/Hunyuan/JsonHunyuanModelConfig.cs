using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.Hunyuan;

public record JsonHunyuanModelConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public required float? Temperature { get; init; }

    [JsonPropertyName("model")]
    public required string Model { get; init; }
}