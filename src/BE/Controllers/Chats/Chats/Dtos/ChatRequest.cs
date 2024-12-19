using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.Services.UrlEncryption;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record ChatRequest
{
    [JsonPropertyName("modelId")]
    public required short ModelId { get; init; }

    [JsonPropertyName("chatId")]
    public required string EncryptedChatId { get; init; }

    [JsonPropertyName("spans")]
    public required ChatSpanRequest[] Spans { get; init; }

    [JsonPropertyName("messageId")]
    public string? EncryptedMessageId { get; init; }

    [JsonPropertyName("userMessage")]
    public MessageContentRequest? UserMessage { get; init; }

    public DecryptedChatRequest Decrypt(IUrlEncryptionService idEncryption)
    {
        return new DecryptedChatRequest
        {
            ModelId = ModelId,
            ChatId = idEncryption.DecryptChatId(EncryptedChatId),
            Spans = Spans,
            MessageId = EncryptedMessageId == null ? null : idEncryption.DecryptMessageId(EncryptedMessageId),
            UserMessage = UserMessage
        };
    }
}

public record DecryptedChatRequest
{
    public required short ModelId { get; init; }

    public required int ChatId { get; init; }

    public required ChatSpanRequest[] Spans { get; init; }

    public required long? MessageId { get; init; }

    public required MessageContentRequest? UserMessage { get; init; }

    public bool AllSystemPromptSame => Spans.Select(x => x.SystemPrompt).Distinct().Count() == 1;
}

public record ChatSpanRequest
{
    [JsonPropertyName("spanId")]
    public required byte SpanId { get; init; }

    [JsonPropertyName("prompt")]
    public required string? SystemPrompt { get; init; }

    public bool SystemPromptValid => !string.IsNullOrEmpty(SystemPrompt);
}