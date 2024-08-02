using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonFileConfig
{
    [JsonPropertyName("count")]
    public required int Count { get; init; }

    [JsonPropertyName("maxSize")]
    public required int MaxSize { get; init; }
}
