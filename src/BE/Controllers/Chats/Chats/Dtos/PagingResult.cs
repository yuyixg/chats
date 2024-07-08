using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record PagingResult<T> where T : class
{
    [JsonPropertyName("rows")]
    public required T[] Rows { get; init; }

    [JsonPropertyName("count")]
    public required int Count { get; init; }
}
