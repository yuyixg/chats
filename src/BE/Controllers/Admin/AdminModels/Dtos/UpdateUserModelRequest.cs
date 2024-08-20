using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminModels.Dtos;

public record UpdateUserModelRequest
{
    [JsonPropertyName("userModelId")]
    public required Guid UserModelId { get; init; }

    [JsonPropertyName("models")]
    public required List<JsonTokenBalance> Models { get; init; }
}
