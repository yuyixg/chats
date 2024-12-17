using Chats.BE.Services.ChatServices.Extensions;
using OpenAI.Chat;
using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonUserModelConfig
{
    [JsonPropertyName("prompt")]
    public string? Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public float? Temperature { get; init; }

    [JsonPropertyName("enableSearch")]
    public bool? EnableSearch { get; init; }

    [JsonPropertyName("maxLength")]
    public int? MaxLength { get; init; }

    public ChatCompletionOptions ToChatCompletionOptions(int userId)
    {
        ChatCompletionOptions cco = new()
        {
            Temperature = Temperature,
            EndUserId = userId.ToString(),
        };
        cco.SetAllowSearch(EnableSearch ?? false);
        return cco;
    }
}
