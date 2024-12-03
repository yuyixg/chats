using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminMessage.Dtos;

public record AdminChatsDto
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

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
    public required JsonUserModelConfig UserModelConfig { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }
}

public record AdminChatsDtoTemp
{
    public required int Id { get; init; }

    public required string UserName { get; init; }

    public required string Title { get; init; }

    public required string ModelName { get; init; }

    public required bool IsDeleted { get; init; }

    public required bool IsShared { get; init; }

    public required JsonUserModelConfig JsonUserModelConfig { get; init; }

    public required DateTime CreatedAt { get; init; }

    public AdminChatsDto ToDto()
    {
        return new AdminChatsDto
        {
            Id = Id.ToString(),
            UserName = UserName,
            Title = Title,
            ModelName = ModelName,
            IsDeleted = IsDeleted,
            IsShared = IsShared,
            UserModelConfig = JsonUserModelConfig,
            CreatedAt = CreatedAt
        };
    }
}