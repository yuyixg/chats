using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminMessage.Dtos;

public record AdminChatsDto
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("username")]
    public required string UserName { get; init; }

    [JsonPropertyName("title")]
    public required string Title { get; init; }

    [JsonPropertyName("modelName")]
    public required string ModelName { get; init; }

    [JsonPropertyName("isDeleted")]
    public required bool IsDeleted { get; init; }

    [JsonPropertyName("isShared")]
    public required bool IsShared { get; init; }

    [JsonPropertyName("userModelConfig")]
    public required Dictionary<string, object> UserModelConfig { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }
}

public record AdminChatsDtoTemp
{
    public required Guid Id { get; init; }

    public required string UserName { get; init; }

    public required string Title { get; init; }

    public required string ModelName { get; init; }

    public required bool IsDeleted { get; init; }

    public required bool IsShared { get; init; }

    public required string JsonUserModelConfig { get; init; }

    public required DateTime CreatedAt { get; init; }

    public AdminChatsDto ToDto()
    {
        return new AdminChatsDto
        {
            Id = Id,
            UserName = UserName,
            Title = Title,
            ModelName = ModelName,
            IsDeleted = IsDeleted,
            IsShared = IsShared,
            UserModelConfig = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonUserModelConfig)!,
            CreatedAt = CreatedAt
        };
    }
}