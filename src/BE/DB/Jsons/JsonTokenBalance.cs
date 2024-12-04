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

    public bool ApplyTo(UserModel existingItem, int? creditUserId)
    {
        bool needsTransaction = existingItem.CountBalance != Counts || existingItem.TokenBalance != Tokens;
        bool hasDifference =
            needsTransaction ||
            existingItem.IsDeleted != !Enabled ||
            (Enabled && existingItem.ExpiresAt != Expires);

        if (needsTransaction)
        {
            UsageTransaction ut = new()
            {
                CreatedAt = DateTime.UtcNow,
                CountAmount = Counts - existingItem.CountBalance,
                TokenAmount = Tokens - existingItem.TokenBalance,
                UserModelId = existingItem.Id,
                TransactionTypeId = (byte)DBTransactionType.Charge,
            };
            ApplyCreditUser(existingItem, creditUserId, ut);
            existingItem.UsageTransactions.Add(ut);
        }

        if (hasDifference)
        {
            existingItem.CountBalance = Counts;
            existingItem.TokenBalance = Tokens;
            existingItem.ExpiresAt = Expires;
            existingItem.IsDeleted = !Enabled;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }

        return hasDifference;
    }

    private static void ApplyCreditUser(UserModel existingItem, int? creditUserId, UsageTransaction ut)
    {
        if (creditUserId.HasValue)
        {
            ut.CreditUserId = creditUserId.Value;
        }
        else if (existingItem.User != null)
        {
            ut.CreditUser = existingItem.User;
        }
        else
        {
            ut.CreditUserId = existingItem.UserId;
        }
    }
}
