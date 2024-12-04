using System.Text.Json.Serialization;

namespace Chats.BE.Services.FileServices.Implementations.AwsS3;

public record AwsS3Config : IHaveBucket
{
    [JsonPropertyName("region")]
    public string? Region { get; init; }

    [JsonPropertyName("accessKeyId")]
    public string? AccessKeyId { get; init; }

    [JsonPropertyName("secretAccessKey")]
    public string? SecretAccessKey { get; init; }

    [JsonPropertyName("bucket")]
    public required string Bucket { get; init; }
}

public interface IHaveBucket
{
    string Bucket { get; }
}