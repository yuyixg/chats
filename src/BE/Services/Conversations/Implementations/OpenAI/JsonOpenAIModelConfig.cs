using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.OpenAI;

public record JsonOpenAIModelConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public float? Temperature { get; init; }

    [JsonPropertyName("model")]
    public required string DeploymentName { get; init; }
}