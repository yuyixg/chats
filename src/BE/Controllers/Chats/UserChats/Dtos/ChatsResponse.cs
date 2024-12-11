using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.UrlEncryption;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.UserChats.Dtos;

public record ChatsResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("title")]
    public required string Title { get; init; }

    [JsonPropertyName("modelId")]
    public required short ModelId { get; init; }

    [JsonPropertyName("modelName")]
    public required string ModelName { get; init; }

    [JsonPropertyName("userModelConfig")]
    public required JsonUserModelConfig UserModelConfig { get; init; }

    [JsonPropertyName("isShared")]
    public required bool IsShared { get; init; }

    [JsonPropertyName("modelProviderId")]
    public DBModelProvider ModelProviderId { get; init; }

    public static ChatsResponse FromDB(Chat chat, IUrlEncryptionService idEncryption)
    {
        return new ChatsResponse()
        {
            Id = idEncryption.EncryptChatId(chat.Id),
            Title = chat.Title,
            ModelId = chat.ModelId,
            ModelName = chat.Model.Name,
            UserModelConfig = new JsonUserModelConfig 
            { 
                EnableSearch = chat.EnableSearch, 
                Temperature = chat.Temperature,
            },
            IsShared = chat.IsShared,
            ModelProviderId = (DBModelProvider)chat.Model.ModelKey.ModelProviderId, 
        };
    }
}

public record ChatsResponseTemp
{
    public required int Id { get; init; }

    public required string Title { get; init; }

    public required short ChatModelId { get; init; }

    public required string ModelName { get; init; }

    public bool? EnableSearch { get; init; }

    public float? Temperature { get; internal set; }

    public required JsonUserModelConfig UserModelConfig { get; init; }

    public required bool IsShared { get; init; }

    public required DBModelProvider ModelProvider { get; init; }

    public ChatsResponse ToResponse(IUrlEncryptionService idEncryption)
    {
        return new ChatsResponse()
        {
            Id = idEncryption.EncryptChatId(Id),
            Title = Title,
            ModelId = ChatModelId,
            ModelName = ModelName,
            UserModelConfig = UserModelConfig,
            IsShared = IsShared, 
            ModelProviderId = ModelProvider,
        };
    }
}