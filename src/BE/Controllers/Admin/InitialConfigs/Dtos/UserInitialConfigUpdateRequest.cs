using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.InitialConfigs.Dtos;

public class UserInitialConfigUpdateRequest
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("loginType")]
    public required string LoginType { get; init; }

    [JsonPropertyName("models")]
    public required JsonTokenBalance[] Models { get; init; }

    [JsonPropertyName("price")]
    public required string Price { get; init; }

    [JsonPropertyName("invitationCodeId")]
    public required string InvitationCodeId { get; init; }
}
