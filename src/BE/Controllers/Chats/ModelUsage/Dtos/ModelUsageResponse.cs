using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.ModelUsage.Dtos;

public record ModelUsageResponse
{
    [JsonPropertyName("counts")]
    public required string Counts { get; init; }

    [JsonPropertyName("tokens")]
    public required string Tokens { get; init; }

    [JsonPropertyName("expires")]
    public required string Expires { get; init; }

    [JsonPropertyName("prices")]
    public required string Prices { get; init; }
}
