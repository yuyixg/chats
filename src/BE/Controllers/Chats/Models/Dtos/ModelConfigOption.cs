using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record ModelConfigOption
{
    [JsonPropertyName("temperature")]
    public required TemperatureOptions Temperature { get; init; }

    public static ModelConfigOption FromJson(TemperatureOptions temperatureOptions)
    {
        return new ModelConfigOption
        {
            Temperature = temperatureOptions
        };
    }
}
