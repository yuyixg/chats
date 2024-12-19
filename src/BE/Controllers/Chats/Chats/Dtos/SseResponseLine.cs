using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.Services.ChatServices;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record SseResponseLine<T> : SseResponseLine
{
    [JsonPropertyName("r")]
    public required T Result { get; init; }
}

[JsonPolymorphic]
[JsonDerivedType(typeof(SseResponseLine<string>))]
[JsonDerivedType(typeof(SseResponseLine<MessageDto>))]
public record SseResponseLine
{
    [JsonPropertyName("i"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public byte? SpanId { get; init; }

    [JsonPropertyName("k")]
    public required SseResponseKind Kind { get; init; }

    public static SseResponseLine<string> Segment(byte spanId, string segment)
    {
        return new SseResponseLine<string>
        {
            SpanId = spanId,
            Result = segment,
            Kind = SseResponseKind.Segment,
        };
    }

    public static SseResponseLine<string> Error(byte spanId, string error)
    {
        return new SseResponseLine<string>
        {
            Result = error,
            SpanId = spanId,
            Kind = SseResponseKind.Error,
        };
    }

    public static SseResponseLine<MessageDto> ResponseMessage(
        byte spanId,
        Message assistantMessage,
        IUrlEncryptionService urlEncryptionService,
        FileUrlProvider fup)
    {
        ChatMessageTemp assistantMessageTemp = new()
        {
            Content = [.. assistantMessage.MessageContents],
            CreatedAt = assistantMessage.CreatedAt,
            Id = assistantMessage.Id,
            ParentId = assistantMessage.ParentId,
            Role = (DBChatRole)assistantMessage.ChatRoleId,
            SpanId = assistantMessage.SpanId,
            Usage = assistantMessage.Usage == null ? null : new ChatMessageTempUsage()
            {
                Duration = assistantMessage.Usage.TotalDurationMs - assistantMessage.Usage.PreprocessDurationMs,
                FirstTokenLatency = assistantMessage.Usage.FirstResponseDurationMs,
                InputPrice = assistantMessage.Usage.InputCost,
                InputTokens = assistantMessage.Usage.InputTokens,
                ModelId = assistantMessage.Usage.UserModel.ModelId,
                ModelName = assistantMessage.Usage.UserModel.Model.Name,
                OutputPrice = assistantMessage.Usage.OutputCost,
                OutputTokens = assistantMessage.Usage.OutputTokens,
                ReasoningTokens = assistantMessage.Usage.ReasoningTokens,
            },
        };
        MessageDto assistantMessageDto = assistantMessageTemp.ToDto(urlEncryptionService, fup);
        return new SseResponseLine<MessageDto>
        {
            SpanId = spanId,
            Result = assistantMessageDto,
            Kind = SseResponseKind.ResponseMessage,
        };
    }

    public static SseResponseLine<MessageDto> UserMessage(
        Message userMessage,
        IUrlEncryptionService urlEncryptionService,
        FileUrlProvider fup)
    {
        ChatMessageTemp userMessageTemp = new()
        {
            Content = [.. userMessage.MessageContents],
            CreatedAt = userMessage.CreatedAt,
            Id = userMessage.Id,
            ParentId = userMessage.ParentId,
            Role = (DBChatRole)userMessage.ChatRoleId,
            SpanId = userMessage.SpanId,
            Usage = null,
        };
        MessageDto userMessageDto = userMessageTemp.ToDto(urlEncryptionService, fup);
        return new SseResponseLine<MessageDto>
        {
            Result = userMessageDto,
            Kind = SseResponseKind.UserMessage,
        };
    }

    public static SseResponseLine<string> StopId(string stopId)
    {
        return new SseResponseLine<string>
        {
            Result = stopId,
            Kind = SseResponseKind.StopId,
        };
    }

    public static SseResponseLine<string> UpdateTitle(string title)
    {
        return new SseResponseLine<string>
        {
            Result = title,
            Kind = SseResponseKind.UpdateTitle,
        };
    }

    public static SseResponseLine<string> TitleSegment(string titleSegment)
    {
        return new SseResponseLine<string>
        {
            Result = titleSegment,
            Kind = SseResponseKind.TitleSegment,
        };
    }
}
