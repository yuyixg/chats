using Chats.BE.DB.Jsons;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminModels.Dtos;

public record AdminModelDto
{
    [JsonPropertyName("rank")]
    public required int? Rank { get; init; }

    [JsonPropertyName("modelId")]
    public required short ModelId { get; init; }

    [JsonPropertyName("modelProvider")]
    public required string ModelProvider { get; init; }

    [JsonPropertyName("modelVersion")]
    public required string ModelVersion { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    [JsonPropertyName("modelKeysId")]
    public required short ModelKeysId { get; init; }

    [JsonPropertyName("fileServiceId")]
    public required Guid? FileServiceId { get; init; }

    [JsonPropertyName("fileConfig")]
    public required string? FileConfig { get; init; }

    [JsonPropertyName("modelConfig")]
    public required string ModelConfig { get; init; }

    [JsonPropertyName("priceConfig")]
    public required JsonPriceConfig PriceConfig { get; init; }
}

public record AdminModelDtoTemp
{
    public required int? Rank { get; init; }
    public required short ModelId { get; init; }
    public required string ModelProvider { get; init; }
    public required string ModelVersion { get; init; }
    public required string Name { get; init; }
    public required bool Enabled { get; init; }
    public required short ModelKeysId { get; init; }
    public required Guid? FileServiceId { get; init; }
    public required decimal PromptTokenPrice1M { get; init; }
    public required decimal ResponseTokenPrice1M { get; init; }

    public AdminModelDto ToDto()
    {
        return new()
        {
            Rank = Rank,
            ModelId = ModelId,
            ModelProvider = ModelProvider,
            ModelVersion = ModelVersion,
            Name = Name,
            Enabled = Enabled,
            ModelKeysId = ModelKeysId,
            FileServiceId = FileServiceId,
            FileConfig = JsonSerializer.Serialize(JsonFileConfig.Default),
            ModelConfig = "{}",
            PriceConfig = new JsonPriceConfig1M(PromptTokenPrice1M, ResponseTokenPrice1M).ToRaw(),
        };
    }
}