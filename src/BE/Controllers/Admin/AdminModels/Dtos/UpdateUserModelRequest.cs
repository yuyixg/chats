using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminModels.Dtos;

public record UpdateUserModelRequest
{
    [JsonPropertyName("models")]
    public required JsonTokenBalance[] Models { get; init; }
}
