using System.Text.Json.Serialization;

namespace Chats.BE.Services.ChatServices.Implementations.Azure;

public record JsonAzureModelConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public float? Temperature { get; init; }

    [JsonPropertyName("version")]
    public string? Version { get; init; }

    [JsonPropertyName("deploymentName")]
    public required string DeploymentName { get; init; }
}