using System.Text.Json.Serialization;

namespace Chats.BE.Services.Configs;

public record Contact
{
    [JsonPropertyName("qqGroupNumber")]
    public required string QQGroupNumber { get; init; }

    [JsonPropertyName("qqGroupQrCodeLink")]
    public required string QQGroupQrCodeLink { get; init; }
}

public record SiteInfo
{
    [JsonPropertyName("filingNumber")]
    public required string WebsiteRegistrationNumber { get; init; }

    [JsonPropertyName("contact")]
    public required Contact Contact { get; init; }
}