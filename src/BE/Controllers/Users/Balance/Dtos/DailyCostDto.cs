using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Users.Balance.Dtos;

public record DailyCostDto
{
    [JsonPropertyName("date")]
    public required DateOnly Date { get; init; }

    [JsonPropertyName("costAmount")]
    public required decimal CostAmount { get; init; }
}
