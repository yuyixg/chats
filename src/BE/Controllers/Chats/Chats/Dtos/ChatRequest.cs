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
    public required InternalChatSpanRequest[] Spans { get; init; }

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
            UserMessage = UserMessage,
        };
    }
}

public record ChatSpanRequest
{
    [JsonPropertyName("id")]
    public required byte Id { get; init; }

    [JsonPropertyName("systemPrompt")]
    public string? SystemPrompt { get; init; }

    public InternalChatSpanRequest ToInternalChatSpanRequest()
    {
        return new InternalChatSpanRequest
        {
            Id = Id,
            SystemPrompt = SystemPrompt,
        };
    }
}

public record DecryptedChatRequest
{
    public required int ChatId { get; init; }

    public required InternalChatSpanRequest[] Spans { get; init; }

    public required long? MessageId { get; init; }

    public required MessageContentRequest? UserMessage { get; init; }
}

public record InternalChatSpanRequest
{
    [JsonPropertyName("spanId")]
    public required byte Id { get; init; }

    [JsonPropertyName("systemPrompt")]
    public string? SystemPrompt { get; init; }

    [JsonPropertyName("modelId")]
    public short? ModelId { get; init; }

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