using Chats.BE.DB.Enums;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.ModelInfo.DTOs;

public record ModelReferenceDto : SimpleModelReferenceDto
{
    [JsonPropertyName("modelProviderId")]
    public required DBModelProvider ModelProviderId { get; init; }

    [JsonPropertyName("minTemperature")]
    public required decimal MinTemperature { get; init; }

    [JsonPropertyName("maxTemperature")]
    public required decimal MaxTemperature { get; init; }

    [JsonPropertyName("allowVision")]
    public required bool AllowVision { get; init; }

    [JsonPropertyName("allowSearch")]
    public required bool AllowSearch { get; init; }

    [JsonPropertyName("promptTokenPrice1M")]
    public required decimal PromptTokenPrice1M { get; init; }

    [JsonPropertyName("responseTokenPrice1M")]
    public required decimal ResponseTokenPrice1M { get; init; }
}
