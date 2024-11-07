using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.Conversations;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record ModelResponse
{
    [JsonPropertyName("id")]
    public required short Id { get; init; }

    [JsonPropertyName("modelVersion")]
    public required string ModelVersion { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("modelProvider")]
    public required string ModelProvider { get; init; }

    [JsonPropertyName("modelUsage")]
    public required ModelUsageResponse ModelUsage { get; init; }

    [JsonPropertyName("modelConfigOptions")]
    public required ModelConfigOption ModelConfigOptions { get; init; }

    [JsonPropertyName("modelConfig")]
    public required JsonUserModelConfig ModelConfigs { get; init; }

    [JsonPropertyName("fileConfig")]
    public required JsonFileConfig? FileConfig { get; init; }

    [JsonPropertyName("fileServerConfig")]
    public required FileServerConfig? FileServerConfigs { get; init; }
}