using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public class UpdateChatsRequest
{
    [JsonPropertyName("title")]
    public string? Title { get; set; } = null!;

    [JsonPropertyName("modelId")]
    public Guid? ModelId { get; set; }

    [JsonPropertyName("userModelConfig")]
    public string? UserModelConfig { get; set; } = null!;

    [JsonPropertyName("isShared")]
    public bool? IsShared { get; set; }

    [JsonPropertyName("isDeleted")]
    public bool? IsDeleted { get; set; }
}
