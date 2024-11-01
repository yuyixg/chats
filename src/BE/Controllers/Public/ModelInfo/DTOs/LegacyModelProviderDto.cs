using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.ModelInfo.DTOs;

[Obsolete("for old frontend compatibility")]
public record LegacyModelProviderDto
{
    [JsonPropertyName("name")]
    public required string Name{ get; init; }

    [JsonPropertyName("models")]
    public required string[] Models { get; init; }

    [JsonPropertyName("apiConfig")]
    public required JsonModelKey ApiConfig { get; init; }

    [JsonPropertyName("displayName")]
    public required string DisplayName { get; init; }

    [JsonPropertyName("icon")]
    public required string Icon { get; init; }
}
