using Chats.BE.Controllers.Chats.Models.Dtos;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record ChatsResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("title")]
    public required string Title { get; init; }

    [JsonPropertyName("chatModelId")]
    public required string? ChatModelId { get; init; }

    [JsonPropertyName("modelName")]
    public required string? ModelName { get; init; }

    [JsonPropertyName("modelConfig")]
    public required Dictionary<string, object?> ModelConfig { get; init; }

    [JsonPropertyName("userModelConfig")]
    public required ModelConfigOption UserModelConfig { get; init; }

    [JsonPropertyName("isShared")]
    public required bool IsShared { get; init; }
}