using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.Kimi;

public record JsonKimiModelConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public required float Temperature { get; init; }
}
