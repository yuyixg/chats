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
            InputTokenPrice1M = InputTokenPrice * 1000000,
            OutputTokenPrice1M = OutputTokenPrice * 1000000
        };
    }

    public bool IsFree()
    {
        return InputTokenPrice == 0 && OutputTokenPrice == 0;
    }
}

public record JsonPriceConfig1M
{
    public required decimal InputTokenPrice1M { get; init; }

    public required decimal OutputTokenPrice1M { get; init; }

    public override string ToString()
    {
        return $"{InputTokenPrice1M:F2}/{OutputTokenPrice1M:F2}";
    }
}
