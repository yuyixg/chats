using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.AccountLogin;

public record LoginRequest
{
    [JsonPropertyName("username")]
    public string? UserName { get; init; }

    [JsonPropertyName("password")]
    public string? Password { get; init; }

    [JsonPropertyName("code")]
    public string? Code { get; init; }

    public object AsLoginDto()
    {
        return this switch
        {
            { UserName: not null, Password: not null } => new PasswordLoginRequest
            {
                UserName = UserName!,
                Password = Password!
            },
            { Code: not null } => new WeChatLoginRequest
            {
                Code = Code!
            },
            _ => throw new ArgumentException("Invalid login request")
        };
    }
}
