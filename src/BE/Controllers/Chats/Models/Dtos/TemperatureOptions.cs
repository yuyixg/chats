using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record TemperatureOptions(
    [property: JsonPropertyName("min")] decimal Min,
    [property: JsonPropertyName("max")] decimal Max
);