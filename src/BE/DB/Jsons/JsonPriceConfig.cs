using System.Text.Json.Serialization;

namespace Chats.BE.DB.Jsons;

public record JsonPriceConfig
{
    [JsonPropertyName("input")]
    public required decimal InputTokenPrice { get; init; }

    [JsonPropertyName("out")]
    public required decimal OutputTokenPrice { get; init; }

    public JsonPriceConfig1M To1M()
    {
        return new JsonPriceConfig1M
        {
            InputTokenPrice1M = InputTokenPrice * JsonPriceConfig1M.Unit,
            OutputTokenPrice1M = OutputTokenPrice * JsonPriceConfig1M.Unit
        };
    }

    public bool IsFree()
    {
        return InputTokenPrice == 0 && OutputTokenPrice == 0;
    }
}

public record JsonPriceConfig1M
{
    [JsonPropertyName("input")]
    public required decimal InputTokenPrice1M { get; init; }

    [JsonPropertyName("out")]
    public required decimal OutputTokenPrice1M { get; init; }

    public static decimal Unit = 1_000_000;

    public JsonPriceConfig ToRaw()
    {
        return new JsonPriceConfig
        {
            InputTokenPrice = InputTokenPrice1M / Unit,
            OutputTokenPrice = OutputTokenPrice1M / Unit, 
        };
    }

    public override string ToString()
    {
        return $"{InputTokenPrice1M:F2}/{OutputTokenPrice1M:F2}";
    }
}
