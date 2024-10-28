using Chats.BE.Controllers.Chats.Models.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.Conversations;
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
    public required short? ChatModelId { get; init; }

    [JsonPropertyName("modelName")]
    public required string? ModelName { get; init; }

    [JsonPropertyName("modelConfig")]
    public required JsonModelConfig ModelConfig { get; init; }

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
            ChatModelId = chat.ModelId,
            ModelName = chat.Model.Name,
            ModelConfig = new JsonModelConfig
            {
                DeploymentName = chat.Model.DeploymentName,
                EnableSearch = chat.Model.ModelReference.AllowSearch,
                MaxLength = chat.Model.ModelReference.MaxResponseTokens,
                Temperature = ConversationService.DefaultTemperature,
                Version = chat.Model.ModelKey.ModelProvider.Name,
                Prompt = ConversationService.DefaultPrompt,
            },
            UserModelConfig = new JsonUserModelConfig { EnableSearch = chat.EnableSearch, Temperature = chat.Temperature },
            IsShared = chat.IsShared,
            ModelProvider = (DBModelProvider)chat.Model.ModelKey.ModelProviderId, 
        };
    }
}

public record ChatsResponseTemp
{
    public required int Id { get; init; }

    public required string Title { get; init; }

    public required short ChatModelId { get; init; }

    public required string? ModelName { get; init; }

    public bool? EnableSearch { get; init; }

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
            ModelConfig = new JsonModelConfig
            {
                Prompt = ConversationService.DefaultPrompt,
                Temperature = Temperature ?? ConversationService.DefaultTemperature,
            },
            UserModelConfig = UserModelConfig,
            IsShared = IsShared, 
            ModelProvider = ModelProvider,
        };
    }
}