using System.Text.Json.Serialization;

namespace Chats.BE.Services.ChatServices.Implementations.Hunyuan;

public record JsonHunyuanKeyConfig
{
    [JsonPropertyName("secretId")]
    public required string SecretId { get; init; }

    [JsonPropertyName("secretKey")]
    public required string SecretKey { get; init; }
}