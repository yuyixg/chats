namespace Chats.BE.Services.Conversations.Dtos;

public class ConversationSegment
{
    public int InputTokenCountAccumulated { get; init; }

    public int OutputTokenCountAccumulated { get; init; }

    public required string TextSegment { get; init; }
}
