using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.Conversations;
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

    public static ModelResponse FromAll(Model model, JsonTokenBalance userModel, FileService? fileService, TemperatureOptions temperatureOptions)
    {
        return new ModelResponse
        {
            Id = model.Id.ToString(),
            ModelVersion = model.ModelReference.Name,
            Name = model.Name,
            ModelProvider = model.ModelKey.ModelProvider.Name,
            ModelUsage = ModelUsage.FromJson(userModel),
            ModelConfigOptions = ModelConfigOption.FromTemperature(temperatureOptions),
            ModelConfigs = JsonUserModelConfig.FromJson(new JsonModelConfig
            {
                DeploymentName = model.DeploymentName,
                Prompt = "",
                Temperature = ConversationService.DefaultTemperature,
            }),
            FileConfig = JsonFileConfig.Default,
            FileServerConfigs = FileServerConfig.FromFileService(fileService)
        };
    }
}