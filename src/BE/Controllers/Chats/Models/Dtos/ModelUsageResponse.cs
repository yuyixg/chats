using Chats.BE.DB;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record ModelUsageResponse
{
    [JsonPropertyName("counts")]
    public required int Counts { get; init; }

    [JsonPropertyName("tokens")]
    public required int Tokens { get; init; }

    [JsonPropertyName("expires")]
    public required DateTime Expires { get; init; }

    [JsonPropertyName("isTerm")]
    public required bool IsTerm { get; init; }

    [JsonPropertyName("promptTokenPrice1M")]
    public required decimal PromptTokenPrice1M { get; init; }

    [JsonPropertyName("responseTokenPrice1M")]
    public required decimal ResponseTokenPrice1M { get; init; }

    public static ModelUsageResponse FromDB(UserModel2 userModel)
    {
        return new ModelUsageResponse
        {
            Counts = userModel.CountBalance,
            Expires = userModel.ExpiresAt,
            IsTerm = userModel.ExpiresAt - DateTime.UtcNow > TimeSpan.FromDays(365 * 2),
            PromptTokenPrice1M = userModel.Model.PromptTokenPrice1M * userModel.Model.ModelReference.CurrencyCodeNavigation.ExchangeRate,
            ResponseTokenPrice1M = userModel.Model.ResponseTokenPrice1M * userModel.Model.ModelReference.CurrencyCodeNavigation.ExchangeRate,
            Tokens = userModel.TokenBalance,
        };
    }
}
