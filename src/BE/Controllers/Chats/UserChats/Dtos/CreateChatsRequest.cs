using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.UserChats.Dtos;

public record CreateChatsRequest
{
    [JsonPropertyName("title")]
    public required string Title { get; init; }
}