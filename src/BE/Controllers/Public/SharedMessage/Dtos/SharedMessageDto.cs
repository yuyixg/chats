using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Public.PublicMessage.Dtos;

public record SharedMessageDto
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("modelName")]
    public required string ModelName { get; init; }

    [JsonPropertyName("messages")]
    public required List<SharedMessageItemDto> Messages { get; init; }
}