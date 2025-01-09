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
            Usage = assistantMessage.MessageResponse?.Usage == null ? null : new ChatMessageTempUsage()
            {
                Duration = assistantMessage.MessageResponse.Usage.TotalDurationMs - assistantMessage.MessageResponse.Usage.PreprocessDurationMs,
                FirstTokenLatency = assistantMessage.MessageResponse.Usage.FirstResponseDurationMs,
                InputPrice = assistantMessage.MessageResponse.Usage.InputCost,
                InputTokens = assistantMessage.MessageResponse.Usage.InputTokens,
                ModelId = assistantMessage.MessageResponse.Usage.UserModel.ModelId,
                ModelName = assistantMessage.MessageResponse.Usage.UserModel.Model.Name,
                OutputPrice = assistantMessage.MessageResponse.Usage.OutputCost,
                OutputTokens = assistantMessage.MessageResponse.Usage.OutputTokens,
                ReasoningTokens = assistantMessage.MessageResponse.Usage.ReasoningTokens,
                ModelProviderId = assistantMessage.MessageResponse.Usage.UserModel.Model.ModelKey.ModelProviderId,
                Reaction = assistantMessage.MessageResponse.ReactionId,
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
