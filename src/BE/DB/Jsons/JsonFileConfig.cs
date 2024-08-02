using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonFileConfig
{
    [JsonPropertyName("count"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? Count { get; init; }

    [JsonPropertyName("maxSize"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? MaxSize { get; init; }
}
