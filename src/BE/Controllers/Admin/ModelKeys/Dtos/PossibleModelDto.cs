using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.ModelKeys.Dtos;

public record PossibleModelDto
{
    [JsonPropertyName("referenceName")]
    public required string ReferenceName { get; init; }

    [JsonPropertyName("modelReferenceId")]
    public required short ReferenceId { get; init; }

    [JsonPropertyName("isExists")]
    public required bool IsExists { get; init; }

    [JsonPropertyName("deploymentName")]
    public required string? DeploymentName { get; init; }

    [JsonPropertyName("isLegacy")]
    public required bool IsLegacy { get; init; }
}
