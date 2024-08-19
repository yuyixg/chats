using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Users.ChangePassword.Dtos;

public record LegacyChangePasswordRequest
{
    [JsonPropertyName("newPassword")]
    public required string NewPassword { get; init; }
}
