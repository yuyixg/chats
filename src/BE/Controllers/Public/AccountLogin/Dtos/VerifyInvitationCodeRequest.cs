using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.AccountLogin.Dtos;

public record VerifyInvitationCodeRequest
{
    [JsonPropertyName("invitationCode")]
    public required string Code { get; init; }
}
