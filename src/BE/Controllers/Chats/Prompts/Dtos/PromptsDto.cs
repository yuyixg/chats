using Chats.BE.DB;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Prompts.Dtos;

public record PromptsDto
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("content")]
    public required string? Content { get; init; }

    [JsonPropertyName("description")]
    public required string? Description { get; init; }

    public Prompt ToPrompt(Guid createUserId) => new()
    {
        Id = Id,
        Name = Name,
        Content = Content,
        Description = Description,
        CreatedAt = DateTime.UtcNow,
        CreateUserId = createUserId,
        Type = (int)PromptType.Private,
        UpdatedAt = DateTime.UtcNow
    };
}