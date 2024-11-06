using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonModelConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public required float Temperature { get; init; }

    [JsonPropertyName("model"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Model { get; init; }

    [JsonPropertyName("version"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Version { get; init; }

    [JsonPropertyName("deploymentName")]
    public string? DeploymentName { get; init; }

    [JsonPropertyName("enableSearch")]
    public bool? EnableSearch { get; init; }

    [JsonPropertyName("maxLength")]
    public int? MaxLength { get; init; }
}