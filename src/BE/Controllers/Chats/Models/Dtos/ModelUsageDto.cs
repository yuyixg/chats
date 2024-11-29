using Chats.BE.DB;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record ModelUsageDto
{
    [JsonPropertyName("counts")]
    public required int Counts { get; init; }

    [JsonPropertyName("tokens")]
    public required int Tokens { get; init; }

    [JsonPropertyName("expires")]
    public required DateTime Expires { get; init; }

    [JsonPropertyName("isTerm")]
    public required bool IsTerm { get; init; }

    [JsonPropertyName("inputTokenPrice1M")]
    public required decimal InputTokenPrice1M { get; init; }

    [JsonPropertyName("outputTokenPrice1M")]
    public required decimal OutputTokenPrice1M { get; init; }

    public static ModelUsageDto FromDB(UserModel userModel)
    {
        return new ModelUsageDto
        {
            Counts = userModel.CountBalance,
            Expires = userModel.ExpiresAt,
            IsTerm = userModel.ExpiresAt - DateTime.UtcNow > TimeSpan.FromDays(365 * 2),
            InputTokenPrice1M = userModel.Model.InputTokenPrice1M,
            OutputTokenPrice1M = userModel.Model.OutputTokenPrice1M,
            Tokens = userModel.TokenBalance,
        };
    }
}
