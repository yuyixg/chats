using Chats.BE.Controllers.Chats.Models.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.IdEncryption;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record ChatsResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("title")]
    public required string Title { get; init; }

    [JsonPropertyName("chatModelId")]
    public required Guid? ChatModelId { get; init; }

    [JsonPropertyName("modelName")]
    public required string? ModelName { get; init; }

    [JsonPropertyName("modelConfig")]
    public required Dictionary<string, object?> ModelConfig { get; init; }

    [JsonPropertyName("userModelConfig")]
    public required JsonUserModelConfig UserModelConfig { get; init; }

    [JsonPropertyName("isShared")]
    public required bool IsShared { get; init; }

    [JsonPropertyName("modelProvider")]
    public DBModelProvider ModelProvider { get; init; }

    public static ChatsResponse FromDB(Conversation2 chat, IIdEncryptionService idEncryption)
    {
        return new ChatsResponse()
        {
            Id = idEncryption.Encrypt(chat.Id),
            Title = chat.Title,
            ChatModelId = chat.ChatModelId,
            ModelName = chat.ChatModel.Name,
            ModelConfig = JsonSerializer.Deserialize<Dictionary<string, object?>>(chat.ChatModel!.ModelConfig)!,
            UserModelConfig = new JsonUserModelConfig { EnableSearch = chat.EnableSearch, Temperature = chat.Temperature },
            IsShared = chat.IsShared,
            ModelProvider = Enum.Parse<DBModelProvider>(chat.ChatModel.ModelProvider), 
        };
    }
}

public record ChatsResponseTemp
{
    public required int Id { get; init; }

    public required string Title { get; init; }

    public required short ChatModelId { get; init; }

    public required string? ModelName { get; init; }
    public string? DeploymentName { get; internal set; }
    public float? Temperature { get; internal set; }
    public required JsonUserModelConfig UserModelConfig { get; init; }

    public required bool IsShared { get; init; }

    public required DBModelProvider ModelProvider { get; init; }

    public ChatsResponse ToResponse(IIdEncryptionService idEncryption)
    {
        return new ChatsResponse()
        {
            Id = idEncryption.Encrypt(Id),
            Title = Title,
            ChatModelId = ChatModelId,
            ModelName = ModelName,
            ModelConfig = ModelConfig == null ? [] : JsonSerializer.Deserialize<Dictionary<string, object?>>(ModelConfig)!,
            UserModelConfig = UserModelConfig,
            IsShared = IsShared, 
            ModelProvider = ModelProvider,
        };
    }
}