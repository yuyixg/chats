using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.Sms;

public record SmsLoginRequest
{
    [JsonPropertyName("phone")]
    public required string Phone { get; init; }

    [JsonPropertyName("type")]
    public required int Type { get; init; }
}