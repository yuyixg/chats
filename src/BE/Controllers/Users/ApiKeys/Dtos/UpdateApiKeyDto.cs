using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Users.ApiKeys.Dtos;

public class UpdateApiKeyDto
{
    [JsonPropertyName("comment")]
    public required string? Comment { get; init; }

    [JsonPropertyName("allowEnumerate")]
    public required bool AllowEnumerate { get; init; }

    [JsonPropertyName("allowAllModels")]
    public required bool AllowAllModels { get; init; }

    [JsonPropertyName("expires")]
    public required DateTime Expires { get; init; }

    [JsonPropertyName("models")]
    public required Guid[] Models { get; init; }
}
