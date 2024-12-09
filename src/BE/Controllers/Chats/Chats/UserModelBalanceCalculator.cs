using Chats.BE.DB;
using Chats.BE.DB.Jsons;

namespace Chats.BE.Controllers.Chats.Chats;

public record UserModelBalanceCost(int Counts, int Tokens, decimal Balance, int CostCount, int CostTokens, decimal InputTokenPrice, decimal OutputTokenPrice)
{
    public int RemainingCounts => Counts - CostCount;
    public int RemainingTokens => Tokens - CostTokens;
    public decimal CostBalance => InputTokenPrice + OutputTokenPrice;
    public decimal RemainingBalance => Balance - CostBalance;
    public bool CostUsage => CostCount > 0 || CostTokens > 0;

    public static UserModelBalanceCost Empty => new(0, 0, 0, 0, 0, 0, 0);

    public JsonTokenBalance ToJsonUserModel(JsonTokenBalance existing)
    {
        return existing with
        {
            Counts = RemainingCounts,
            Tokens = RemainingTokens,
        };
    }

    public bool IsSufficient => 
        RemainingCounts >= 0 &&
        RemainingTokens >= 0 &&
        RemainingBalance >= 0;

}

public record UserModelBalanceCalculator(int Counts, int Tokens, decimal Balance)
{
    public UserModelBalanceCalculator(UserModel userModel, decimal balance) : this(
        userModel.CountBalance,
        userModel.TokenBalance,
        balance)
    {
    }

    private UserModelBalanceCost WithCost(int costCount = 0, int costTokens = 0, decimal inputTokenPrice = 0, decimal outputTokenPrice = 0)
    {
        return new UserModelBalanceCost(Counts, Tokens, Balance, costCount, costTokens, inputTokenPrice, outputTokenPrice);
    }

    public UserModelBalanceCost GetNewBalance(int inputTokenCount, int outputTokenCount, JsonPriceConfig price)
    {
        // price model is based on counts
        if (Counts > 0) return WithCost(costCount: 1);

        // price model is based on tokens
        if (Tokens > inputTokenCount + outputTokenCount) return WithCost(costTokens: inputTokenCount + outputTokenCount);

        // token count not enough, check balance by remaining toBeDeductedInputTokens/toBeDeductedOutputTokens
        // calculate toBeDeductedOutputTokens first because it's typically more expensive

        // for example, if inputTokenCount = 100, outputTokenCount = 200, Tokens = 250, then:
        // toBeDeductedOutputTokens = 200-250 = -50(0), and then remaining tokens is 50
        // toBeDeductedInputTokens = 100-50 = 50

        // another example, if inputTokenCount = 100, outputTokenCount = 200, Tokens = 50, then:
        // toBeDeductedOutputTokens = 200-50 = 150, and then remaining tokens is 0
        // toBeDeductedInputTokens = 100-0 = 100
        int remainingTokens = Tokens;
        int toBeDeductedOutputTokens = Math.Max(0, outputTokenCount - remainingTokens);
        remainingTokens = Math.Max(0, remainingTokens - outputTokenCount);
        int toBeDeductedInputTokens = Math.Max(0, inputTokenCount - remainingTokens);

        decimal inputTokenPrice = price.InputTokenPrice * toBeDeductedInputTokens;
        decimal outputTokenPrice = price.OutputTokenPrice * toBeDeductedOutputTokens;
        return WithCost(costTokens: Tokens, inputTokenPrice: inputTokenPrice, outputTokenPrice: outputTokenPrice);
    }
}
