using Chats.BE.Controllers.Chats.Messages.Dtos;
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
    public required MessageContentRequest UserMessage { get; init; }
}

public record ChatSpanRequest
{
    [JsonPropertyName("spanId")]
    public required byte SpanId { get; init; }

    [JsonPropertyName("prompt")]
    public required string? Prompt { get; init; }
}