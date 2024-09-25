using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Conversations.Dtos;

public record ConversationRequest
{
    [JsonPropertyName("modelId")]
    public required Guid ModelId { get; init; }

    [JsonPropertyName("chatId")]
    public required int ConversationId { get; init; }

    [JsonPropertyName("messageId")]
    public int? MessageId { get; init; }

    [JsonPropertyName("userMessage")]
    public required MessageContentRequest UserMessage { get; init; }

    [JsonPropertyName("userModelConfig")]
    public required JsonUserModelConfig UserModelConfig { get; init; }
}