using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.Services.UrlEncryption;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public abstract record BaseChatRequest
{
    [JsonPropertyName("chatId")]
    public required string EncryptedChatId { get; init; }

    public abstract ChatRequest ToChatRequest(IUrlEncryptionService idEncryption);
}

public record FreshChatRequest : BaseChatRequest
{
    [JsonPropertyName("spans")]
    public required ChatSpanRequest[] Spans { get; init; }

    [JsonPropertyName("userMessage")]
    public required MessageContentRequest UserMessage { get; init; }

    [JsonPropertyName("parentAssistantMessageId")]
    public required string? ParentAssistantMessageId { get; init; }

    public override ChatRequest ToChatRequest(IUrlEncryptionService idEncryption)
    {
        return new ChatRequest
        {
            ChatId = idEncryption.DecryptChatId(EncryptedChatId),
            Spans = Spans,
            UserMessage = UserMessage,
            MessageId = ParentAssistantMessageId switch
            {
                null => null, 
                _ => idEncryption.DecryptMessageId(ParentAssistantMessageId)
            }
        };
    }
}

public record RegenerateAssistantMessageRequest : BaseChatRequest
{
    [JsonPropertyName("parentUserMessageId")]
    public required string ParentUserMessageId { get; init; }

    [JsonPropertyName("spanId")]
    public required byte SpanId { get; init; }

    [JsonPropertyName("modelId")]
    public required short ModelId { get; init; }

    public override ChatRequest ToChatRequest(IUrlEncryptionService idEncryption)
    {
        return new ChatRequest
        {
            ChatId = idEncryption.DecryptChatId(EncryptedChatId),
            MessageId = idEncryption.DecryptMessageId(ParentUserMessageId),
            Spans = [new ChatSpanRequest { Id = SpanId, ModelId = ModelId }],
            UserMessage = null,
        };
    }
}

public record GeneralChatRequest : BaseChatRequest
{
    [JsonPropertyName("spanIds")]
    public required int[] SpanIds { get; init; }

    [JsonPropertyName("userMessage")]
    public required MessageContentRequest UserMessage { get; init; }

    [JsonPropertyName("parentAssistantMessageId")]
    public required string? ParentAssistantMessageId { get; init; }

    public override ChatRequest ToChatRequest(IUrlEncryptionService idEncryption)
    {
        return new ChatRequest
        {
            ChatId = idEncryption.DecryptChatId(EncryptedChatId),
            MessageId = ParentAssistantMessageId switch
            {
                null => null,
                _ => idEncryption.DecryptMessageId(ParentAssistantMessageId)
            },
            Spans = SpanIds.Select(x => new ChatSpanRequest() { Id = (byte)x }).ToArray(),
            UserMessage = UserMessage
        };
    }
}