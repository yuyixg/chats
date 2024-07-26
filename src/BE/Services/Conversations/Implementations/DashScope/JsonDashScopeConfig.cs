using System.Text.Json.Serialization;

namespace Chats.BE.Services.Conversations.Implementations.DashScope;

public class JsonDashScopeConfig
{
    [JsonPropertyName("host")]
    public required string Host { get; init; }

    [JsonPropertyName("apiKey")]
    public required string ApiKey { get; init; }
}
