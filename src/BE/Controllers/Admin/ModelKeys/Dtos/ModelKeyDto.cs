using Chats.BE.DB.Jsons;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.ModelKeys.Dtos;

public record ModelKeyDtoTemp
{
    public required short Id { get; init; }

    public required string ProviderName { get; init; }

    public required string Name { get; init; }

    public required int EnabledModelCount { get; init; }

    public required int TotalModelCount { get; init; }

    public required string? Host { get; init; }

    public required string? Secret { get; init; }

    public required DateTime CreatedAt { get; init; }

    public ModelKeyDto ToDto(bool maskFields = true)
    {
        ModelKeyDto dto = new()
        {
            Id = Id,
            Type = ProviderName,
            Name = Name,
            Configs = JsonSerializer.Deserialize<JsonModelKey>(Configs)!,
            CreatedAt = CreatedAt,
            EnabledModelCount = EnabledModelCount,
            TotalModelCount = TotalModelCount
        };

        return maskFields ? dto.WithMaskedKeys() : dto;
    }
}

public record ModelKeyDto
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("type")]
    public required string Type { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("enabledModelCount")]
    public required int EnabledModelCount { get; init; }

    [JsonPropertyName("totalModelCount")]
    public required int TotalModelCount { get; init; }

    [JsonPropertyName("configs")]
    public required JsonModelKey Configs { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }

    public ModelKeyDto WithMaskedKeys()
    {
        return this with { Configs = Configs.WithMaskedKey() };
    }
}
