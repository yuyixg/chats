using Chats.BE.DB;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record CreateChatSpanRequest
{
    [JsonPropertyName("modelId")]
    public short? ModelId { get; init; }

    [JsonPropertyName("setsTemperature")]
    public bool SetsTemperature { get; init; } = false;

    [JsonPropertyName("temperature")]
    public float? Temperature { get; init; }

    [JsonPropertyName("enableSearch")]
    public bool? EnableSearch { get; init; }

    public void ApplyTo(ChatSpan span)
    {
        if (ModelId != null)
        {
            span.ModelId = ModelId.Value;
        }

        if (SetsTemperature)
        {
            span.Temperature = Temperature;
        }

        if (EnableSearch != null)
        {
            span.EnableSearch = EnableSearch.Value;
        }
    }
}
