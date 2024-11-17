using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminModels.Dtos;

public record AdminModelDto
{
    [JsonPropertyName("modelId")]
    public required short ModelId { get; init; }

    [JsonPropertyName("modelProviderId")]
    public required short ModelProviderId { get; init; }

    [JsonPropertyName("modelReferenceId")]
    public required short ModelReferenceId { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("rank")]
    public required short? Rank { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    [JsonPropertyName("modelKeyId")]
    public required short ModelKeyId { get; init; }

    [JsonPropertyName("fileServiceId")]
    public required Guid? FileServiceId { get; init; }

    [JsonPropertyName("deploymentName")]
    public required string? DeploymentName { get; init; }

    [JsonPropertyName("inputTokenPrice1M")]
    public required decimal InputTokenPrice1M { get; init; }

    [JsonPropertyName("outputTokenPrice1M")]
    public required decimal OutputTokenPrice1M { get; init; }
}