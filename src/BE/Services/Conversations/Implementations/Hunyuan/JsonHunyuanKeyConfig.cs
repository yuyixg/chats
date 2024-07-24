using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.Hunyuan;

public record JsonHunyuanKeyConfig
{
    [JsonPropertyName("host")]
    public string? Host { get; init; }

    [JsonPropertyName("secret")]
    public required string Secret { get; init; }

    [JsonPropertyName("apiKey")]
    public required string ApiKey { get; init; }
}