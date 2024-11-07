using Chats.BE.DB.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonTokenBalance
{
    [JsonPropertyName("modelId")]
    public required short ModelId { get; init; }

    [JsonPropertyName("tokens"), Range(0, int.MaxValue / 2)]
    public required int Tokens { get; init; }

    [JsonPropertyName("counts"), Range(0, int.MaxValue / 2)]
    public required int Counts { get; init; }

    [JsonPropertyName("expires")]
    public required DateTime Expires { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    public void ApplyTo(UserModel2 existingItem)
    {
        UserModelTransactionLog? toReturn = existingItem.CountBalance != Counts || existingItem.TokenBalance != Tokens
            ? new UserModelTransactionLog
            {
                CreatedAt = DateTime.UtcNow,
                CountAmount = Counts - existingItem.CountBalance,
                TokenAmount = Tokens - existingItem.TokenBalance,
                UserModelId = existingItem.Id,
                TransactionTypeId = (byte)DBTransactionType.Charge,
            } : null;

        existingItem.UpdatedAt = DateTime.UtcNow;
        existingItem.CountBalance = Counts;
        existingItem.TokenBalance = Tokens;
        existingItem.ExpiresAt = Expires;
        existingItem.IsDeleted = !Enabled;

        if (toReturn != null)
        {
            existingItem.UserModelTransactionLogs.Add(toReturn);
        }
    }
}