using System.Text.Json.Serialization;

namespace Chats.BE.Services.Models.ChatServices.DashScope;

public class JsonDashScopeConfig
{
    [JsonPropertyName("host")]
    public required string Host { get; init; }

    [JsonPropertyName("apiKey")]
    public required string ApiKey { get; init; }
}
