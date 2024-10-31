using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record ModelUsage
{
    [JsonPropertyName("counts")]
    public required string Counts { get; init; }

    [JsonPropertyName("expires")]
    public required string Expires { get; init; }

    [JsonPropertyName("tokens")]
    public required string Tokens { get; init; }

    public static ModelUsage FromJson(JsonTokenBalance userModel)
    {
        return new ModelUsage
        {
            Tokens = userModel.Tokens.ToString(),
            Counts = userModel.Counts.ToString(),
            Expires = userModel.Expires.ToString()
        };
    }
}
