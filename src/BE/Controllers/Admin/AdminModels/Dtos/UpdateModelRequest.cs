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

    [JsonPropertyName("modelVersion")]
    public required string ModelVersion { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    [JsonPropertyName("modelConfig")]
    public required string ModelConfig { get; init; }

    [JsonPropertyName("modelKeysId")]
    public required Guid ModelKeysId { get; init; }

    [JsonPropertyName("fileServiceId")]
    public Guid? FileServiceId { get; init; }

    [JsonPropertyName("fileConfig")]
    public string? FileConfig { get; init; }

    [JsonPropertyName("priceConfig")]
    public required string PriceConfig { get; init; }

    [JsonPropertyName("remarks")]
    public string? Remarks { get; init; }

    public void ApplyTo(ChatModel cm)
    {
        cm.Name = Name;
        cm.ModelVersion = ModelVersion;
        cm.Enabled = Enabled;
        cm.ModelConfig = ModelConfig;
        cm.ModelKeysId = ModelKeysId;
        cm.FileServiceId = FileServiceId;
        cm.FileConfig = FileConfig;
        cm.PriceConfig = JSON.Serialize(JsonSerializer.Deserialize<JsonPriceConfig1M>(PriceConfig)!.ToRaw());
        cm.Remarks = Remarks;
    }
}
