using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminUser.Dtos;

public record AdminUserDto
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("username")]
    public required string Username { get; init; }

    [JsonPropertyName("account")]
    public required string Account { get; init; }

    [JsonPropertyName("role")]
    public required string Role { get; init; }

    [JsonPropertyName("balance")]
    public required string Balance { get; init; }

    [JsonPropertyName("avatar")]
    public required string? Avatar { get; init; }

    [JsonPropertyName("phone")]
    public required string? Phone { get; init; }

    [JsonPropertyName("email")]
    public required string? Email { get; init; }

    [JsonPropertyName("provider")]
    public required string? Provider { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }

    //[JsonPropertyName("userModelId")]
    //public required Guid UserModelId { get; init; }

    [JsonPropertyName("userModelCount")]
    public required int UserModelCount { get; init; }

    [JsonPropertyName("models")]
    public required JsonTokenBalance[] Models { get; init; }
}

public record AdminUserDtoTemp
{
    public required Guid Id { get; init; }
    public required string Username { get; init; }
    public required string Account { get; init; }
    public required string Role { get; init; }
    public required string Balance { get; init; }
    public required string? Avatar { get; init; }
    public required string? Phone { get; init; }
    public required string? Email { get; init; }
    public required string? Provider { get; init; }
    public required bool Enabled { get; init; }
    public required DateTime CreatedAt { get; init; }
    //public required Guid UserModelId { get; init; }
    public required int UserModelCount { get; init; }
    public required UserModel2[] Models { get; init; }

    public AdminUserDto ToDto() => new()
    {
        Id = Id,
        Username = Username,
        Account = Account,
        Role = Role,
        Balance = Balance,
        Avatar = Avatar,
        Phone = Phone,
        Email = Email,
        Provider = Provider,
        Enabled = Enabled,
        CreatedAt = CreatedAt,
        //UserModelId = UserModelId,
        UserModelCount = UserModelCount,
        Models = Models.Select(x => x.ToJsonTokenBalance()).ToArray(),
    };
}