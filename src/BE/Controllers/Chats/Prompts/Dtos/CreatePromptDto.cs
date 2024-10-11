using Chats.BE.DB;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Prompts.Dtos;

public record CreatePromptDto
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("content")]
    public required string Content { get; init; }

    [JsonPropertyName("isSystem")]
    public bool IsSystem { get; init; }

    [JsonPropertyName("isDefault")]
    public bool IsDefault { get; init; }

    public Prompt ToPrompt(Guid createUserId, bool isAdmin) => new()
    {
        Name = Name,
        Content = Content,
        CreatedAt = DateTime.UtcNow,
        CreateUserId = createUserId,
        UpdatedAt = DateTime.UtcNow,
        IsDefault = IsDefault,
        IsSystem = isAdmin && IsSystem,
    };
}