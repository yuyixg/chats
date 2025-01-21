namespace Chats.BE.Services.Models.Dtos;

public record ChatTokenUsage
{
    public required int InputTokens { get; init; }

    public required int OutputTokens { get; init; }

    public int ReasoningTokens { get; init; }

    public static ChatTokenUsage Zero { get; } = new ChatTokenUsage
    {
        InputTokens = 0,
        OutputTokens = 0,
        ReasoningTokens = 0,
    };
}