using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.GLM;

public record JsonGLMModelConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public required double Temperature { get; init; }

    [JsonPropertyName("model")]
    public required string Model { get; init; }
}
