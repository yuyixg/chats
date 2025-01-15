using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.Services.ChatServices;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record SseResponseLine
{
    [JsonPropertyName("k")]
    public required SseResponseKind Kind { get; init; }

    [JsonPropertyName("i"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public byte? SpanId { get; init; }

    [JsonPropertyName("r")]
    public required object Result { get; init; }

    public static SseResponseLine Segment(byte spanId, string segment)
    {
        return new SseResponseLine
        {
            SpanId = spanId,
            Result = segment,
            Kind = SseResponseKind.Segment,
        };
    }

    public static SseResponseLine Error(byte spanId, string error)
    {
        return new SseResponseLine
        {
            Result = error,
            SpanId = spanId,
            Kind = SseResponseKind.Error,
        };
    }

    public static SseResponseLine ResponseMessage(
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
                ModelProviderId = assistantMessage.Usage.UserModel.Model.ModelKey.ModelProviderId,
                Reaction = assistantMessage.ReactionId,
            },
        };
        MessageDto assistantMessageDto = assistantMessageTemp.ToDto(urlEncryptionService, fup);
        return new SseResponseLine
        {
            SpanId = spanId,
            Result = assistantMessageDto,
            Kind = SseResponseKind.ResponseMessage,
        };
    }

    public static SseResponseLine UserMessage(
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
        return new SseResponseLine
        {
            Result = userMessageDto,
            Kind = SseResponseKind.UserMessage,
        };
    }

    public static SseResponseLine StopId(string stopId)
    {
        return new SseResponseLine
        {
            Result = stopId,
            Kind = SseResponseKind.StopId,
        };
    }

    public static SseResponseLine UpdateTitle(string title)
    {
        return new SseResponseLine
        {
            Result = title,
            Kind = SseResponseKind.UpdateTitle,
        };
    }

    public static SseResponseLine TitleSegment(string titleSegment)
    {
        return new SseResponseLine
        {
            Result = titleSegment,
            Kind = SseResponseKind.TitleSegment,
        };
    }

    public static SseResponseLine ChatLeafMessageId(long leafMessageId, IUrlEncryptionService idEncryption)
    {
        return new SseResponseLine
        {
            Result = idEncryption.EncryptMessageId(leafMessageId),
            Kind = SseResponseKind.ChatLeafMessageId,
        };
    }
}
