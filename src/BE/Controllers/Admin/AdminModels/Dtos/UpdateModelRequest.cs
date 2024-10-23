using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Services;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminModels.Dtos;

public record UpdateModelRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    //[JsonPropertyName("modelVersion")]
    //public required string ModelVersion { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    //[JsonPropertyName("modelConfig")]
    //public required string ModelConfig { get; init; }

    [JsonPropertyName("modelKeysId")]
    public required short ModelKeysId { get; init; }

    [JsonPropertyName("fileServiceId")]
    public Guid? FileServiceId { get; init; }

    //[JsonPropertyName("fileConfig")]
    //public string? FileConfig { get; init; }

    [JsonPropertyName("priceConfig")]
    public required string PriceConfig { get; init; }

    //[JsonPropertyName("remarks")]
    //public string? Remarks { get; init; }

    public void ApplyTo(Model cm)
    {
        JsonPriceConfig1M price = JsonSerializer.Deserialize<JsonPriceConfig1M>(PriceConfig)!;
        cm.Name = Name;
        cm.IsDeleted = !Enabled;
        cm.ModelKeyId = ModelKeysId;
        cm.FileServiceId = FileServiceId;
        cm.PromptTokenPrice1M = price.InputTokenPrice1M;
        cm.ResponseTokenPrice1M = price.OutputTokenPrice1M;
    }
}
