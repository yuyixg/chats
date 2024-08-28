using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record ModelResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("modelVersion")]
    public required string ModelVersion { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("modelProvider")]
    public required string ModelProvider { get; init; }

    [JsonPropertyName("modelUsage")]
    public required ModelUsage ModelUsage { get; init; }

    [JsonPropertyName("modelConfigOptions")]
    public required ModelConfigOption ModelConfigOptions { get; init; }

    [JsonPropertyName("modelConfig")]
    public required JsonUserModelConfig ModelConfigs { get; init; }

    [JsonPropertyName("fileConfig")]
    public required JsonFileConfig? FileConfig { get; init; }

    [JsonPropertyName("fileServerConfig")]
    public required FileServerConfig? FileServerConfigs { get; init; }

    public static ModelResponse FromAll(ChatModel model, JsonTokenBalance userModel, JsonModelConfig modelConfig, FileService? fileService, TemperatureOptions temperatureOptions)
    {
        return new ModelResponse
        {
            Id = model.Id.ToString(),
            ModelVersion = model.ModelVersion,
            Name = model.Name,
            ModelProvider = model.ModelProvider,
            ModelUsage = ModelUsage.FromJson(userModel),
            ModelConfigOptions = ModelConfigOption.FromTemperature(temperatureOptions),
            ModelConfigs = JsonUserModelConfig.FromJson(modelConfig),
            FileConfig = string.IsNullOrEmpty(model.FileConfig) ? null : JsonSerializer.Deserialize<JsonFileConfig>(model.FileConfig),
            FileServerConfigs = FileServerConfig.FromFileService(fileService)
        };
    }
}