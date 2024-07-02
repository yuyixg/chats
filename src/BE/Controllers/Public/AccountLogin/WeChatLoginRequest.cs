namespace Chats.BE.Controllers.Public.AccountLogin;

public record WeChatLoginRequest
{
    public required string Code { get; init; }
}
