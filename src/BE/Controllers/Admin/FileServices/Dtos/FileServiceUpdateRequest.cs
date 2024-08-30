using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.FileServices.Dtos;

public record FileServiceUpdateRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("type")]
    public required string Type { get; init; }

    [JsonPropertyName("enabled")]
    public required bool Enabled { get; init; }

    [JsonPropertyName("configs")]
    public required string Configs { get; init; }

    public void ApplyTo(FileService data)
    {
        data.Name = Name;
        data.Type = Type;
        data.Enabled = Enabled;
        JsonMinioConfig newConfig = JsonSerializer.Deserialize<JsonMinioConfig>(Configs)!;
        JsonMinioConfig oldConfig = JsonSerializer.Deserialize<JsonMinioConfig>(data.Configs)!;
        if (!oldConfig.IsMaskedEquals(newConfig))
        {
            data.Configs = Configs;
        }
    }
}
