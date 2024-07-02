using Chats.BE.DB;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Models.Dtos;

public record FileServerConfig
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("type")]
    public required string Type { get; init; }

    public static FileServerConfig? FromFileService(FileService? fileService)
    {
        if (fileService == null)
        {
            return null;
        }

        return new FileServerConfig
        {
            Id = fileService.Id,
            Type = fileService.Type
        };
    }
}
