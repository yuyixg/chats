using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminModels.Dtos;

public record ValidateModelRequest
{
    [JsonPropertyName("modelReferenceId")]
    public required string ModelReferenceId { get; init; }

    [JsonPropertyName("deploymentName")]
    public required string? DeploymentName { get; init; }

    [JsonPropertyName("modelKeysId")]
    public required short ModelKeyId { get; init; }
}