using System.Text.Json.Serialization;

namespace Chats.BE.Services.FileServices.Implementations.AwsS3;

public record AwsS3Config
{
    [JsonPropertyName("region")]
    public required string Region { get; init; }

    [JsonPropertyName("accessKeyId")]
    public required string AccessKeyId { get; init; }

    [JsonPropertyName("secretAccessKey")]
    public required string SecretAccessKey { get; init; }

    [JsonPropertyName("bucket")]
    public required string Bucket { get; init; }
}