using Chats.BE.Controllers.Chats.Conversations;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.Common;
using Chats.BE.Services.Conversations.Dtos;
using System.Diagnostics;
using System.Text;

namespace Chats.BE.Services.Conversations;

public class InChatContext()
{
    private long _firstTick = Stopwatch.GetTimestamp();
    private long _preprocessTick, _firstResponseTick;
    private short _segmentCount;
    public UserModelBalanceCost Cost { get; private set; } = null!;
    private UserModel _userModel = null!;
    private InternalChatSegment _lastSegment = InternalChatSegment.Empty;
    private StringBuilder _fullResult = new();


    public async IAsyncEnumerable<InternalChatSegment> Run(string modelName, decimal userBalance, UserModel userModel, IAsyncEnumerable<InternalChatSegment> segments)
    {
        _userModel = userModel;
        if (userModel.ExpiresAt.IsExpired())
        {
            throw new SubscriptionExpiredException(userModel.ExpiresAt);
        }
        JsonPriceConfig priceConfig = userModel.Model.ToPriceConfig();
        if (userModel.TokenBalance == 0 && userModel.CountBalance == 0 && userBalance == 0 && !priceConfig.IsFree())
        {
            throw new InsufficientBalanceException();
        }

        UserModelBalanceCalculator calculator = new(userModel.CountBalance, userModel.TokenBalance, userBalance);
        Cost = calculator.GetNewBalance(0, 0, priceConfig);
        if (!Cost.IsSufficient)
        {
            throw new InsufficientBalanceException();
        }

        _preprocessTick = Stopwatch.GetTimestamp();
        await foreach (InternalChatSegment seg in segments)
        {
            if (seg.IsFromUpstream)
            {
                _segmentCount++;
                _firstResponseTick = Stopwatch.GetTimestamp();
            }
            _lastSegment = seg;
            _fullResult.Append(seg.TextSegment);

            UserModelBalanceCost currentCost = calculator.GetNewBalance(seg.Usage.InputTokens, seg.Usage.OutputTokens, priceConfig);
            if (!currentCost.IsSufficient)
            {
                throw new InsufficientBalanceException();
            }
            Cost = currentCost;
            yield return seg;
        }
    }

    public InternalChatSegment FullResponse => _lastSegment with { TextSegment = _fullResult.ToString() };

    public UserModelUsage ToUserModelUsage(Guid userId, ClientInfo clientInfo, bool isApi)
    {
        UserModelUsage usage = new()
        {
            UserModelId = _userModel.Id,
            CreatedAt = DateTime.UtcNow,
            SegmentCount = _segmentCount,
            PreprocessDurationMs = (int)Stopwatch.GetElapsedTime(_firstTick, _preprocessTick).TotalMilliseconds,
            FirstResponseDurationMs = (int)Stopwatch.GetElapsedTime(_preprocessTick, _firstResponseTick).TotalMilliseconds,
            TotalDurationMs = (int)Stopwatch.GetElapsedTime(_firstTick, Stopwatch.GetTimestamp()).TotalMilliseconds,
            InputTokens = _lastSegment.Usage.InputTokens,
            OutputTokens = _lastSegment.Usage.OutputTokens,
            ReasoningTokens = _lastSegment.Usage.ReasoningTokens,
            IsUsageReliable = _lastSegment.IsUsageReliable,
            InputCost = Cost.InputTokenPrice,
            OutputCost = Cost.OutputTokenPrice,
            ClientInfo = clientInfo,
        };

        byte transactionTypeId = (byte)(isApi ? DBTransactionType.ApiCost : DBTransactionType.Cost);
        if (Cost.CostBalance > 0)
        {
            usage.BalanceTransaction = new()
            {
                UserId = userId,
                CreatedAt = usage.CreatedAt,
                CreditUserId = userId,
                Amount = -Cost.CostBalance,
                TransactionTypeId = transactionTypeId,
            };
        }
        if (Cost.CostCount > 0 || Cost.CostTokens > 0)
        {
            usage.UsageTransaction = new()
            {
                UserModelId = _userModel.Id,
                CreatedAt = usage.CreatedAt,
                CountAmount = -Cost.CostCount,
                TokenAmount = -Cost.CostTokens,
                TransactionTypeId = transactionTypeId,
            };
        }

        return usage;
    }
}