using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.Conversations.Dtos;
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
    public required ModelConfig ModelConfigs { get; init; }

    [JsonPropertyName("fileConfig")]
    public required string? FileConfig { get; init; }

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
            ModelConfigs = ModelConfig.FromJson(modelConfig),
            FileConfig = model.FileConfig,
            FileServerConfigs = FileServerConfig.FromFileService(fileService)
        };
    }
}