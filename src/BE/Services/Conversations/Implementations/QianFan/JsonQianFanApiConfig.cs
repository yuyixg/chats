using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.QianFan;

public record JsonQianFanApiConfig
{
    [JsonPropertyName("apiKey")]
    public required string ApiKey { get; init; }

    [JsonPropertyName("secret")]
    public required string Secret { get; init; }
}