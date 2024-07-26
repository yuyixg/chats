using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.QianFan;

public record JsonQianFanModelConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public required float Temperature { get; init; }

    [JsonPropertyName("model")]
    public required string Model { get; init; }

    [JsonPropertyName("enableSearch")]
    public bool? EnableSearch { get; init; }
}
