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
    private readonly long _firstTick = Stopwatch.GetTimestamp();
    private long _preprocessTick, _firstResponseTick, _endResponseTick, _finishTick;
    private short _segmentCount;
    public UserModelBalanceCost Cost { get; private set; } = UserModelBalanceCost.Empty;
    private UserModel _userModel = null!;
    private InternalChatSegment _lastSegment = InternalChatSegment.Empty;
    private readonly StringBuilder _fullResult = new();
    public DBFinishReason FinishReason { get; set; } = DBFinishReason.Success;

    public async IAsyncEnumerable<InternalChatSegment> Run(decimal userBalance, UserModel userModel, IAsyncEnumerable<InternalChatSegment> segments)
    {
        _preprocessTick = Stopwatch.GetTimestamp(); // ensure _preprocessTick is not 0
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

        try
        {
            _preprocessTick = Stopwatch.GetTimestamp();
            await foreach (InternalChatSegment seg in segments)
            {
                if (seg.IsFromUpstream)
                {
                    _segmentCount++;
                    if (_firstResponseTick == 0) _firstResponseTick = Stopwatch.GetTimestamp();
                }
                _lastSegment = seg;
                _fullResult.Append(seg.TextSegment);

                UserModelBalanceCost currentCost = calculator.GetNewBalance(seg.Usage.InputTokens, seg.Usage.OutputTokens, priceConfig);
                if (!currentCost.IsSufficient)
                {
                    FinishReason = DBFinishReason.InsufficientBalance;
                    throw new InsufficientBalanceException();
                }
                Cost = currentCost;
                FinishReason = seg.ToDBFinishReason() ?? FinishReason;

                yield return seg;
            }
        }
        finally
        {
            _endResponseTick = Stopwatch.GetTimestamp();
        }
    }

    public InternalChatSegment FullResponse => _lastSegment with { TextSegment = _fullResult.ToString() };

    public UserModelUsage ToUserModelUsage(int userId, ClientInfo clientInfo, bool isApi)
    {
        if (_finishTick == 0) _finishTick = Stopwatch.GetTimestamp();

        UserModelUsage usage = new()
        {
            UserModelId = _userModel.Id,
            CreatedAt = DateTime.UtcNow,
            FinishReasonId = (byte)FinishReason,
            SegmentCount = _segmentCount,
            PreprocessDurationMs = (int)Stopwatch.GetElapsedTime(_firstTick, _preprocessTick).TotalMilliseconds,
            FirstResponseDurationMs = (int)Stopwatch.GetElapsedTime(_preprocessTick, _firstResponseTick).TotalMilliseconds,
            PostprocessDurationMs = (int)Stopwatch.GetElapsedTime(_endResponseTick, _finishTick).TotalMilliseconds,
            TotalDurationMs = (int)Stopwatch.GetElapsedTime(_firstTick, _finishTick).TotalMilliseconds,
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
                CreditUserId = userId,
                CreatedAt = usage.CreatedAt,
                CountAmount = -Cost.CostCount,
                TokenAmount = -Cost.CostTokens,
                TransactionTypeId = transactionTypeId,
            };
        }

        return usage;
    }
}