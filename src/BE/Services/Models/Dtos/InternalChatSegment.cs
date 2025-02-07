using Chats.BE.Controllers.OpenAICompatible.Dtos;
using OpenAI.Chat;

namespace Chats.BE.Services.Models.Dtos;

public record InternalChatSegment
{
    public required ChatFinishReason? FinishReason { get; init; }

    public required string? Segment { get; init; }

    public required string? ReasoningSegment { get; init; }

    public required ChatTokenUsage Usage { get; init; }

    public required bool IsUsageReliable { get; init; }

    public required bool IsFromUpstream { get; init; }

    public static InternalChatSegment Empty { get; } = new InternalChatSegment
    {
        Usage = ChatTokenUsage.Zero,
        FinishReason = null,
        Segment = null,
        ReasoningSegment = null,
        IsUsageReliable = false, 
        IsFromUpstream = false,
    };

    public DBFinishReason? ToDBFinishReason()
    {
        if (FinishReason is null)
        {
            return null;
        }

        return FinishReason switch
        {
            ChatFinishReason.Stop => DBFinishReason.Stop,
            ChatFinishReason.Length => DBFinishReason.Length,
            ChatFinishReason.ToolCalls => DBFinishReason.ToolCalls,
            ChatFinishReason.ContentFilter => DBFinishReason.ContentFilter,
            ChatFinishReason.FunctionCall => DBFinishReason.FunctionCall,
            _ => throw new ArgumentOutOfRangeException(nameof(FinishReason), FinishReason, "Unknown ChatFinishReason value.")
        };
    }

    public static InternalChatSegment InputOnly(int inputTokens) => Empty with { Usage = ChatTokenUsage.Zero with { InputTokens = inputTokens } };

    private string? GetFinishReasonText()
    {
        return FinishReason switch
        {
            ChatFinishReason.Stop => "stop",
            ChatFinishReason.Length => "length",
            ChatFinishReason.ToolCalls => "tool_calls",
            ChatFinishReason.ContentFilter => "content_filter",
            ChatFinishReason.FunctionCall => "function_call",
            null => null,
            _ => throw new ArgumentOutOfRangeException(nameof(FinishReason), FinishReason, "Unknown ChatFinishReason value.")
        };
    }

    private Usage ToOpenAIUsage()
    {
        return new Usage
        {
            CompletionTokens = Usage.OutputTokens,
            PromptTokens = Usage.InputTokens,
            TotalTokens = Usage.InputTokens + Usage.OutputTokens,
            CompletionTokensDetails = new CompletionTokensDetails()
            {
                ReasoningTokens = Usage.ReasoningTokens
            }
        };
    }

    internal ChatCompletionChunk ToOpenAIChunk(string modelName, string traceId)
    {
        return new()
        {
            Id = traceId,
            Object = "chat.completion.chunk",
            Created = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Model = modelName,
            Choices =
            [
                new DeltaChoice
                {
                    Delta = new Delta { Content = Segment, ReasoningContent = ReasoningSegment },
                    FinishReason = GetFinishReasonText(),
                    Index = 0,
                    Logprobs = null,
                }
            ],
            SystemFingerprint = null,
            Usage = ToOpenAIUsage(),
        };
    }

    internal FullChatCompletion ToOpenAIFullChat(string modelName, string traceId)
    {
        return new FullChatCompletion()
        {
            Id = traceId,
            Choices =
            [
                new MessageChoice
                {
                    Index = 0,
                    FinishReason = GetFinishReasonText(),
                    Logprobs = null,
                    Message = new ResponseMessage
                    {
                        Role = "system",
                        Content = Segment,
                        ReasoningContent = ReasoningSegment,
                        Refusal = null,
                    }
                }
            ],
            Object = "chat.completion",
            Created = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Model = modelName,
            SystemFingerprint = null,
            Usage = ToOpenAIUsage(),
        };
    }
}
