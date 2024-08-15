using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Users.Balance.Dtos;

public record LegacyBalanceDto
{
    [JsonPropertyName("balance")]
    public required decimal Balance { get; init; }

    [JsonPropertyName("logs")]
    public required LegacyBalanceLog[] Logs { get; init; }
}

public record LegacyBalanceLog
{
    [JsonPropertyName("value")]
    public required decimal Amount { get; init; }

    [JsonPropertyName("date")]
    public required DateTimeOffset Date { get; init; }
}
