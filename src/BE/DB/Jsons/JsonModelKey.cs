using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonModelKey
{
    [JsonPropertyName("host"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Host { get; init; }

    [JsonPropertyName("apiKey")]
    public required string ApiKey { get; init; }

    [JsonPropertyName("secret"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Secret { get; init; }

    public JsonModelKey WithMaskedKey()
    {
        string maskedApiKey = ApiKey.Length > 7 ? ApiKey[..5] + "****" + ApiKey[^2..] : ApiKey;
        string? maskedSecret = Secret is not null && Secret.Length > 7 ? Secret[..5] + "****" + Secret[^2..] : null;
        return this with { ApiKey = maskedApiKey, Secret = maskedSecret };
    }

    public bool IsMaskedEquals(JsonModelKey inputKey)
    {
        if (inputKey.LooksLikeMasked())
        {
            return WithMaskedKey() == inputKey;
        }
        else
        {
            return this == inputKey;
        }
    }

    public bool LooksLikeMasked()
    {
        return ApiKey.Length == 11 && ApiKey[5..9] == "****";
    }
}
