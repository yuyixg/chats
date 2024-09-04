using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using System.Text.Json;
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

    public void ApplyToChats(Conversation chat)
    {
        if (Title != null)
        {
            chat.Title = Title;
        }
        if (ModelId != null)
        {
            chat.ChatModelId = ModelId.Value;
        }
        if (UserModelConfig != null)
        {
            JsonUserModelConfig obj = JsonSerializer.Deserialize<JsonUserModelConfig>(UserModelConfig)!;
            chat.Temperature = obj.Temperature;
            chat.EnableSearch = obj.EnableSearch;
        }
        if (IsShared != null)
        {
            chat.IsShared = IsShared.Value;
        }
        if (IsDeleted != null)
        {
            chat.IsDeleted = IsDeleted.Value;
        }
    }
}
