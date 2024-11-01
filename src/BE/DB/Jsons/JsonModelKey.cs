using Chats.BE.Services.Common;
using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonModelKey
{
    [JsonPropertyName("host"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Host { get; init; }

    [JsonPropertyName("secret"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Secret { get; init; }

    public JsonModelKey WithMaskedKey()
    {
        return this with { Secret = Secret.ToMaskedNull() };
    }

    public bool IsMaskedEquals(JsonModelKey inputKey)
    {
        if (inputKey.Secret.SeemsMasked())
        {
            return WithMaskedKey() == inputKey;
        }
        else
        {
            return this == inputKey;
        }
    }
}
