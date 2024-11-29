using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminModels.Dtos;

public record ValidateModelRequest
{
    [JsonPropertyName("modelReferenceId")]
    public required short ModelReferenceId { get; init; }

    [JsonPropertyName("deploymentName")]
    public required string? DeploymentName { get; init; }

    [JsonPropertyName("modelKeyId")]
    public required short ModelKeyId { get; init; }
}