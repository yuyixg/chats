using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.Azure;

public record JsonAzureModelConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public float? Temperature { get; init; }

    [JsonPropertyName("version")]
    public required string Version { get; init; }

    [JsonPropertyName("deploymentName")]
    public required string DeploymentName { get; init; }

    internal static JsonAzureModelConfig Parse(string modelConfigText)
    {
        return JsonSerializer.Deserialize<JsonAzureModelConfig>(modelConfigText)!;
    }
}