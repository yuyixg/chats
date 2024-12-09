using System.Text.Json.Serialization;

namespace Chats.BE.Services.Configs;

public record SiteInfo
{
    [JsonPropertyName("filingNumber")]
    public string? WebsiteRegistrationNumber { get; init; }

    [JsonPropertyName("companyName")]
    public string? CompanyName { get; init; }
}