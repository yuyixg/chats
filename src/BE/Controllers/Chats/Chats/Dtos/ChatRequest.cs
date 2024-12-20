using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.Services.ChatServices.Extensions;
using Chats.BE.Services.UrlEncryption;
using OpenAI.Chat;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record ChatRequest
{
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
            ChatId = idEncryption.DecryptChatId(EncryptedChatId),
            Spans = Spans,
            MessageId = EncryptedMessageId == null ? null : idEncryption.DecryptMessageId(EncryptedMessageId),
            UserMessage = UserMessage
        };
    }
}

public record DecryptedChatRequest
{
    public required int ChatId { get; init; }

    public required ChatSpanRequest[] Spans { get; init; }

    public required long? MessageId { get; init; }

    public required MessageContentRequest? UserMessage { get; init; }

    public bool AllSystemPromptSame => Spans.Select(x => x.SystemPrompt).Distinct().Count() == 1;
}

public record ChatSpanRequest
{
    [JsonPropertyName("spanId")]
    public required byte Id { get; init; }

    [JsonPropertyName("prompt")]
    public required string? SystemPrompt { get; init; }

    public bool SystemPromptValid => !string.IsNullOrEmpty(SystemPrompt);

    public ChatCompletionOptions ToChatCompletionOptions(int userId, ChatSpan span)
    {
        ChatCompletionOptions cco = new()
        {
            Temperature = span.Temperature,
            EndUserId = userId.ToString(),
        };
        cco.SetAllowSearch(span.EnableSearch);
        return cco;
    }
}