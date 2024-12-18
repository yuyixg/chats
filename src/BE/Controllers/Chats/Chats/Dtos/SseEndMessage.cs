using Chats.BE.Controllers.Chats.Messages.Dtos;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record SseEndMessage
{
    [JsonPropertyName("requestMessage")]
    public required MessageDto? RequestMessage { get; init; }

    [JsonPropertyName("responseMessage")]
    public required MessageDto ResponseMessage { get; init; }
}
