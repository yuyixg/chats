using Chats.BE.DB.Jsons;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.InitialConfigs.Dtos;

public class UserInitialConfigDto
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

    [JsonPropertyName("invitationCode")]
    public required string InvitationCode { get; init; }
}

public class UserInitialConfigDtoTemp
{
    public required Guid Id { get; init; }

    public required string Name { get; init; }

    public required string LoginType { get; init; }

    public required string Models { get; init; }

    public required decimal Price { get; init; }

    public required Guid? InvitationCodeId { get; init; }

    public required string InvitationCode { get; init; }

    internal UserInitialConfigDto ToDto()
    {
        return new UserInitialConfigDto
        {
            Id = Id,
            Name = Name,
            LoginType = LoginType,
            Models = [.. JsonSerializer.Deserialize<JsonTokenBalance[]>(Models)!
                .OrderByDescending(x => x.Enabled)
                .ThenByDescending(x => x.Tokens)
                .ThenByDescending(x => x.Counts)
                .ThenByDescending(x => x.Expires)],
            Price = Price.ToString(),
            InvitationCodeId = InvitationCodeId?.ToString() ?? "-",
            InvitationCode = InvitationCode
        };
    }
}