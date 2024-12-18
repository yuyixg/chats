using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.Services.ChatServices;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record SseResponseLine<T>
{
    [JsonPropertyName("r")]
    public required T Result { get; init; }

    [JsonPropertyName("k")]
    public required SseResponseKind Kind { get; init; }
}

public static class SseResponseLine
{
    public static SseResponseLine<string> Segment(string segment)
    {
        return new SseResponseLine<string>
        {
            Result = segment,
            Kind = SseResponseKind.Segment,
        };
    }

    public static SseResponseLine<string> Error(string error)
    {
        return new SseResponseLine<string>
        {
            Result = error,
            Kind = SseResponseKind.Error,
        };
    }

    public static SseResponseLine<SseEndMessage> PostMessage(
        Message? userMessage,
        Message assistantMessage,
        IUrlEncryptionService urlEncryptionService,
        FileUrlProvider fup)
    {
        ChatMessageTemp? userMessageTemp = userMessage == null ? null : new ChatMessageTemp()
        {
            Content = [.. userMessage.MessageContents],
            CreatedAt = userMessage.CreatedAt,
            Id = userMessage.Id,
            ParentId = userMessage.ParentId,
            Role = (DBChatRole)userMessage.ChatRoleId,
            Usage = null,
        };
        ChatMessageTemp assistantMessageTemp = new()
        {
            Content = [.. assistantMessage.MessageContents],
            CreatedAt = assistantMessage.CreatedAt,
            Id = assistantMessage.Id,
            ParentId = assistantMessage.ParentId,
            Role = (DBChatRole)assistantMessage.ChatRoleId,
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
        MessageDto? userMessageDto = userMessageTemp?.ToDto(urlEncryptionService, fup);
        MessageDto assistantMessageDto = assistantMessageTemp.ToDto(urlEncryptionService, fup);
        return new SseResponseLine<SseEndMessage>
        {
            Result = new SseEndMessage
            {
                RequestMessage = userMessageDto,
                ResponseMessage = assistantMessageDto
            },
            Kind = SseResponseKind.PostMessage,
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
