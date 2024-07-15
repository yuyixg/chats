namespace Chats.BE.Services.Conversations.Dtos;

public class ConversationSegment
{
    public int InputTokenCount { get; init; }

    public int OutputTokenCount { get; init; }

    public required string TextSegment { get; init; }
}
