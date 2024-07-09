using Chats.BE.Controllers.Chats.Models.Dtos;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record ChatsResponse
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("title")]
    public required string Title { get; init; }

    [JsonPropertyName("chatModelId")]
    public required Guid? ChatModelId { get; init; }

    [JsonPropertyName("modelName")]
    public required string? ModelName { get; init; }

    [JsonPropertyName("modelConfig")]
    public required Dictionary<string, object?> ModelConfig { get; init; }

    [JsonPropertyName("userModelConfig")]
    public required Dictionary<string, object?> UserModelConfig { get; init; }

    [JsonPropertyName("isShared")]
    public required bool IsShared { get; init; }
}

public record ChatsResponseTemp
{
    public required Guid Id { get; init; }

    public required string Title { get; init; }

    public required Guid? ChatModelId { get; init; }

    public required string? ModelName { get; init; }

    public required string? ModelConfig { get; init; }

    public required string UserModelConfig { get; init; }

    public required bool IsShared { get; init; }

    public ChatsResponse ToResponse()
    {
        return new ChatsResponse()
        {
            Id = Id,
            Title = Title,
            ChatModelId = ChatModelId,
            ModelName = ModelName,
            ModelConfig = ModelConfig == null ? [] : JsonSerializer.Deserialize<Dictionary<string, object?>>(ModelConfig)!,
            UserModelConfig = JsonSerializer.Deserialize<Dictionary<string, object?>>(UserModelConfig)!,
            IsShared = IsShared
        };
    }
}