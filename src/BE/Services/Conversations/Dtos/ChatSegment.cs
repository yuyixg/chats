using OpenAI.Chat;

namespace Chats.BE.Services.Conversations.Dtos;

public record ChatSegment
{
    public required ChatFinishReason? FinishReason { get; init; }

    public required string TextSegment { get; init; }

    public required ChatTokenUsage? Usage { get; init; }

    public InternalChatSegment ToInternal(Func<ChatTokenUsage> usageCalculator)
    {
        if (Usage is not null)
        {
            return new InternalChatSegment
            {
                Usage = Usage,
                FinishReason = FinishReason,
                TextSegment = TextSegment,
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
                TextSegment = TextSegment,
                IsUsageReliable = false,
                IsFromUpstream = true,
            };
        }
    }
}
