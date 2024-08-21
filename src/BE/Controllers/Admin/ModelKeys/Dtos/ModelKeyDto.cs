using Chats.BE.DB.Jsons;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.ModelKeys.Dtos;

public record ModelKeyDtoTemp
{
    public required Guid Id { get; init; }

    public required string Type { get; init; }

    public required string Name { get; init; }

    public required string Configs { get; init; }

    public required DateTime CreatedAt { get; init; }

    public ModelKeyDto ToDto(bool maskFields = true)
    {
        ModelKeyDto dto = new()
        {
            Id = Id,
            Type = Type,
            Name = Name,
            Configs = JsonSerializer.Deserialize<JsonModelKey>(Configs)!,
            CreatedAt = CreatedAt,
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

    [JsonPropertyName("configs")]
    public required JsonModelKey Configs { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }

    public ModelKeyDto WithMaskedKeys()
    {
        return this with { Configs = Configs.WithMaskedKey() };
    }
}
