using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.QianFan;

public record JsonQianFanApiConfig
{
    [JsonPropertyName("host")]
    public required string Host { get; init; }

    [JsonPropertyName("apiKey")]
    public required string ApiKey { get; init; }

    [JsonPropertyName("secret")]
    public required string Secret { get; init; }
}