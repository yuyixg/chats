using System.Text.Json.Serialization;

namespace Chats.BE.Services.Configs;

public record SiteInfo
{
    [JsonPropertyName("filingNumber")]
    public required string WebsiteRegistrationNumber { get; init; }

    [JsonPropertyName("companyName")]
    public required string CompanyName { get; init; }
}