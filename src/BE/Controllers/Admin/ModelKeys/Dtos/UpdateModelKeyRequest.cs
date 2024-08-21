using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.ModelKeys.Dtos;

public record UpdateModelKeyRequest
{
    [JsonPropertyName("type")]
    public required string Type { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("configs")]
    public required string Configs { get; init; }
}
