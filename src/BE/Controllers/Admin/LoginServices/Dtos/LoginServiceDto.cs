using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.LoginServices.Dtos;

public record LoginServiceDto
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("type")]
    public required string Type { get; init; }

    [JsonPropertyName("configs")]
    public object? Configs { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }
}
