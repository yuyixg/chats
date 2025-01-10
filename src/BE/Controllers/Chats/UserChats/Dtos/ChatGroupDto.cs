using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.UserChats.Dtos;

public record ChatGroupDto
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("rank")]
    public required short Rank { get; init; }

    [JsonPropertyName("isExpanded")]
    public required bool IsExpanded { get; init; }
}

public record ChatGroupDtoWithMessage : ChatGroupDto
{
    [JsonPropertyName("messages")]
    public PagedResult<ChatsResponse> Messages { get; set; } = null!;
}

public record CreateChatGroupRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("isExpanded")]
    public required bool IsExpanded { get; init; }
}

public record UpdateChatGroupRequest
{
    [JsonPropertyName("name")]
    public string? Name { get; init; }

    [JsonPropertyName("rank")]
    public short? Rank { get; init; }

    [JsonPropertyName("isExpanded")]
    public bool? IsExpanded { get; init; }

    public void ApplyTo(ChatGroup group)
    {
        if (Name is not null)
        {
            group.Name = Name;
        }
        if (Rank is not null)
        {
            group.Rank = Rank.Value;
        }
        if (IsExpanded is not null)
        {
            group.IsExpanded = IsExpanded.Value;
        }
    }
}