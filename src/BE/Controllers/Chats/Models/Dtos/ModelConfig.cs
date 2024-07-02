using Chats.BE.Controllers.Chats.Models.JsonColumn;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record ModelConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public required double Temperature { get; init; }

    [JsonPropertyName("enableSearch")]
    public bool? EnableSearch { get; init; }

    [JsonPropertyName("maxLength")]
    public int? MaxLength { get; init; }

    public static ModelConfig FromJson(JsonModelConfig modelConfig)
    {
        return new ModelConfig
        {
            Prompt = modelConfig.Prompt,
            Temperature = modelConfig.Temperature,
            EnableSearch = modelConfig.EnableSearch,
            MaxLength = modelConfig.MaxLength
        };
    }
}
