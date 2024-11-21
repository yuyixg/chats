using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.FileServices.Dtos;

public record FileServiceSimpleDto
{
    [JsonPropertyName("id")]
    public required int Id { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }
}

public record FileServiceDto : FileServiceSimpleDto
{
    [JsonPropertyName("type")]
    public required string Type { get; init; }

    [JsonPropertyName("configs")]
    public required JsonMinioConfig Configs { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }

    public FileServiceDto WithMaskedKeys()
    {
        return new FileServiceDto
        {
            Id = Id,
            Name = Name,
            Type = Type,
            Configs = Configs.WithMaskedKeys(),
            Enabled = Enabled,
            CreatedAt = CreatedAt,
        };
    }
}

public record FileServiceDtoTemp : FileServiceSimpleDto
{
    public required string Type { get; init; }

    public required string Configs { get; init; }

    public required bool Enabled { get; init; }

    public required DateTime CreatedAt { get; init; }

    internal FileServiceDto ToDto()
    {
        return new FileServiceDto
        {
            Id = Id,
            Name = Name,
            Type = Type,
            Configs = JsonMinioConfig.Parse(Configs),
            Enabled = Enabled,
            CreatedAt = CreatedAt,
        };
    }
}