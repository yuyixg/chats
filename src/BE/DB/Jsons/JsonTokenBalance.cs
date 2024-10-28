using Chats.BE.DB.Enums;
using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonTokenBalance
{
    [JsonPropertyName("modelId")]
    public required short ModelId { get; init; }

    [JsonPropertyName("tokens")]
    public required int Tokens { get; init; }

    [JsonPropertyName("counts")]
    public required int Counts { get; init; }

    [JsonPropertyName("expires")]
    public required DateTime Expires { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    public UserModelTransactionLog? ApplyTo(UserModel2 existingItem)
    {
        existingItem.UpdatedAt = DateTime.UtcNow;
        //existingItem.CountBalance = Counts;
        //existingItem.TokenBalance = Tokens;
        existingItem.ExpiresAt = Expires;
        existingItem.IsDeleted = !Enabled;

        UserModelTransactionLog? toReturn = existingItem.CountBalance != Counts || existingItem.TokenBalance != Tokens
            ? new UserModelTransactionLog
            {
                CreatedAt = DateTime.UtcNow,
                CountAmount = Counts - existingItem.CountBalance,
                TokenAmount = Tokens - existingItem.TokenBalance,
                UserModelId = existingItem.Id,
                TransactionTypeId = (byte)DBTransactionType.Charge,
            } : null;
        return toReturn;
    }
}