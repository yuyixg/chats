using System.Text.Json.Serialization;

namespace Chats.BE.Services.Models;

public record TemperatureOptions
{
    [JsonPropertyName("min")]
    public required int Min { get; init; }

    [JsonPropertyName("max")]
    public required int Max { get; init; }
}
