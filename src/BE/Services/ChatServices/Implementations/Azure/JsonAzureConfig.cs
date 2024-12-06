using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Services.ChatServices.Implementations.Azure;

public record JsonAzureApiConfig
{
    [JsonPropertyName("host")]
    public required string Host { get; init; }

    [JsonPropertyName("apiKey")]
    public required string ApiKey { get; init; }

    public static JsonAzureApiConfig Parse(string json)
    {
        return JsonSerializer.Deserialize<JsonAzureApiConfig>(json)!;
    }
}