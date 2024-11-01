using Chats.BE.Controllers.Chats.Models.Dtos;
using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.ModelInfo.DTOs;

[Obsolete("for old frontend compatibility")]
public record LegacyModelReferenceDto
{
    #region new fields
    [JsonPropertyName("id")]
    public required short Id { get; init; }
    #endregion

    [JsonPropertyName("type")]
    public required string ProviderName { get; init; }

    [JsonPropertyName("config")]
    public required TemperatureOptions Config { get; init; }

    [JsonPropertyName("modelConfig")]
    public required JsonModelConfig ModelConfig { get; init; }

    [JsonPropertyName("fileConfig")]
    public required JsonFileConfig? FileConfig { get; init; }

    [JsonPropertyName("priceConfig")]
    public required JsonPriceConfig PriceConfig { get; init; }
}
