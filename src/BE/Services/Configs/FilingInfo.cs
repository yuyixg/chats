using System.Text.Json.Serialization;

namespace Chats.BE.Services.Configs;

public record Contact
{
    [JsonPropertyName("qqGroupNumber")]
    public required string QQGroupNumber { get; init; }
}

public record FilingInfo
{
    [JsonPropertyName("filingNumber")]
    public required string WebsiteRegistrationNumber { get; init; }

    [JsonPropertyName("contact")]
    public required Contact Contact { get; init; }
}