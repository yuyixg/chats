using OpenAI.Chat;

namespace Chats.BE.Services.Models.Dtos;

public record ChatSegment
{
    public required ChatFinishReason? FinishReason { get; init; }

    public required string? Segment { get; init; }

    public required string? ReasoningSegment { get; init; }

    public required ChatTokenUsage? Usage { get; init; }

    public InternalChatSegment ToInternal(Func<ChatTokenUsage> usageCalculator)
    {
        if (Usage is not null)
        {
            return new InternalChatSegment
            {
                Usage = Usage,
                FinishReason = FinishReason,
                Segment = Segment,
                ReasoningSegment = ReasoningSegment,
                IsUsageReliable = true,
                IsFromUpstream = true, 
            };
        }
        else
        {
            return new InternalChatSegment
            {
                Usage = Usage ?? usageCalculator(),
                FinishReason = FinishReason,
                Segment = Segment,
                ReasoningSegment = ReasoningSegment,
                IsUsageReliable = false,
                IsFromUpstream = true,
            };
        }
    }
}
