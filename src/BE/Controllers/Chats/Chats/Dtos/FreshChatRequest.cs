using Chats.BE.Controllers.Chats.Messages.Dtos;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public abstract record BaseChatRequest
{
    [JsonPropertyName("chatId")]
    public required string EncryptedChatId { get; init; }

    public abstract ChatRequest ToChatRequest();
}

public record FreshChatRequest : BaseChatRequest
{
    [JsonPropertyName("spans")]
    public required ChatSpanRequest[] Spans { get; init; }

    [JsonPropertyName("userMessage")]
    public required MessageContentRequest UserMessage { get; init; }

    [JsonPropertyName("parentAssistantMessageId")]
    public required string? ParentAssistantMessageId { get; init; }

    public override ChatRequest ToChatRequest()
    {
        return new ChatRequest
        {
            EncryptedChatId = EncryptedChatId,
            Spans = Spans.Select(x => x.ToInternalChatSpanRequest()).ToArray(),
            UserMessage = UserMessage,
            EncryptedMessageId = ParentAssistantMessageId,
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

    public override ChatRequest ToChatRequest()
    {
        return new ChatRequest
        {
            EncryptedChatId = EncryptedChatId,
            EncryptedMessageId = ParentUserMessageId, 
            Spans =
            [
                new InternalChatSpanRequest
                {
                    Id = SpanId,
                    ModelId = ModelId
                }
            ]
        };
    }
}

public record GeneralChatRequest : BaseChatRequest
{
    [JsonPropertyName("spanIds")]
    public required byte[] SpanIds { get; init; }

    [JsonPropertyName("userMessage")]
    public required MessageContentRequest UserMessage { get; init; }

    [JsonPropertyName("parentAssistantMessageId")]
    public required string? ParentAssistantMessageId { get; init; }

    public override ChatRequest ToChatRequest()
    {
        return new ChatRequest
        {
            EncryptedChatId = EncryptedChatId,
            EncryptedMessageId = ParentAssistantMessageId,
            Spans = SpanIds.Select(x => new InternalChatSpanRequest() { Id = x }).ToArray(),
            UserMessage = UserMessage
        };
    }
}