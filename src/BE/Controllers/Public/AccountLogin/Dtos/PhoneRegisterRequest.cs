using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.AccountLogin.Dtos;

public record PhoneRegisterRequest
{
    [JsonPropertyName("phone")]
    public required string Phone { get; init; }

    [JsonPropertyName("smsCode")]
    public required string SmsCode { get; init; }

    [JsonPropertyName("invitationCode")]
    public required string InvitationCode { get; init; }
}