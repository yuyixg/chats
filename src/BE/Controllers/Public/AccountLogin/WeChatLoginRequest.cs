using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.AccountLogin;

public record WeChatLoginRequest
{
    [JsonPropertyName("code")]
    public required string Code { get; init; }
}
