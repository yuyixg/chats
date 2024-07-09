using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonPriceConfig
{
    [JsonPropertyName("input")]
    public required decimal PromptTokenPrice { get; init; }

    [JsonPropertyName("out")]
    public required decimal ResponseTokenPrice { get; init; }

    public JsonPriceConfig1M To1M()
    {
        return new JsonPriceConfig1M
        {
            PromptTokenPrice1M = PromptTokenPrice * 1000000,
            ResponseTokenPrice1M = ResponseTokenPrice * 1000000
        };
    }
}

public record JsonPriceConfig1M
{
    public required decimal PromptTokenPrice1M { get; init; }

    public required decimal ResponseTokenPrice1M { get; init; }

    public override string ToString()
    {
        return $"{PromptTokenPrice1M:F2}/{ResponseTokenPrice1M:F2}";
    }
}
