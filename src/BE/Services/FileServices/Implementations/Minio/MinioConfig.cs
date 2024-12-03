using System.Text.Json.Serialization;

namespace Chats.BE.Services.FileServices.Implementations.Minio;

public record MinioConfig
{
    [JsonPropertyName("endpoint")]
    public required string Endpoint { get; init; }

    [JsonPropertyName("accessKey")]
    public required string AccessKey { get; init; }

    [JsonPropertyName("secretKey")]
    public required string SecretKey { get; init; }

    [JsonPropertyName("bucket")]
    public required string Bucket { get; init; }

    [JsonPropertyName("region")]
    public string? Region { get; init; } // Nullable for the default null value.
}