using System.Text.Json.Serialization;
using Chats.BE.Controllers.Chats.Models.JsonColumn;
using Chats.BE.Services.Models;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record ModelConfigOption
{
    [JsonPropertyName("temperature")]
    public required TemperatureOptions Temperature { get; init; }

    public static ModelConfigOption FromJson(JsonUserModel userModel)
    {
        throw new NotImplementedException();
    }
}
