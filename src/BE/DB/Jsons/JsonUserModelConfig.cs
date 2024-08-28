using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonUserModelConfig
{
    [JsonPropertyName("prompt"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Prompt { get; init; }

    [JsonPropertyName("temperature"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public float? Temperature { get; init; }

    [JsonPropertyName("enableSearch"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? EnableSearch { get; init; }

    [JsonPropertyName("maxLength"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? MaxLength { get; init; }

    public static JsonUserModelConfig FromJson(JsonModelConfig modelConfig)
    {
        return new JsonUserModelConfig
        {
            Prompt = modelConfig.Prompt,
            Temperature = modelConfig.Temperature,
            EnableSearch = modelConfig.EnableSearch,
            MaxLength = modelConfig.MaxLength
        };
    }
}
