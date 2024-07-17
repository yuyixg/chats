using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Files.Dtos;

public record JsonMinioConfig
{
    [JsonPropertyName("accessKey")]
    public required string AccessKey { get; init; }

    [JsonPropertyName("accessSecret")]
    public required string AccessSecret { get; init; }

    [JsonPropertyName("endpoint")]
    public required string Endpoint { get; init; }

    [JsonPropertyName("bucketName")]
    public required string BucketName { get; init; }

    public static JsonMinioConfig Parse(string json)
    {
        return JsonSerializer.Deserialize<JsonMinioConfig>(json)!;
    }
}