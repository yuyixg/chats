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
            Configs = (JsonObject)JsonNode.Parse(Configs)!,
            CreatedAt = CreatedAt,
        };

        if (maskFields)
        {
            dto.MaskFields();
        }

        return dto;
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
    public required JsonObject Configs { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }

    public void MaskFields()
    {
        foreach (string fieldToMask in FieldsToMask)
        {
            JsonNode? maskNode = Configs[fieldToMask];
            if (maskNode != null && maskNode.GetValueKind() == JsonValueKind.String)
            {
                string plainText = maskNode.GetValue<string>();
                Configs[fieldToMask] = plainText[..5] + "****" + plainText[^2..];
            }
        }
    }

    private static string[] FieldsToMask { get; } = ["apiKey", "secret"];
}