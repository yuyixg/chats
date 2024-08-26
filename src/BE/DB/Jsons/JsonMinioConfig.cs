using Chats.BE.Services.Common;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

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

    public JsonMinioConfig WithMaskedKeys()
    {
        return this with
        {
            AccessKey = AccessKey.ToMasked(), 
            AccessSecret = AccessSecret.ToMasked()
        };
    }
}