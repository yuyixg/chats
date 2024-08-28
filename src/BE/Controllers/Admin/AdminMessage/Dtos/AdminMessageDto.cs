using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.Conversations;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminMessage.Dtos;

public record AdminMessageDto
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("modelName")]
    public required string ModelName { get; init; }

    [JsonPropertyName("modelTemperature")]
    public required float ModelTemperature { get; init; }

    [JsonPropertyName("modelPrompt")]
    public string? ModelPrompt { get; init; }

    [JsonPropertyName("messages")]
    public required AdminMessageBasicItem[] Messages { get; init; }
}

public record AdminMessageDtoTemp
{
    public required string Name { get; init; }
    public required string ModelName { get; init; }
    public required string ModelConfigText { get; init; }
    public required string UserModelConfigText { get; init; }

    public JsonModelConfig JsonModelConfig => JsonSerializer.Deserialize<JsonModelConfig>(ModelConfigText)!;

    public JsonUserModelConfig JsonUserModelConfig => JsonSerializer.Deserialize<JsonUserModelConfig>(UserModelConfigText)!;

    public AdminMessageDto ToDto(AdminMessageBasicItem[] messages)
    {
        return new AdminMessageDto
        {
            Name = Name,
            ModelName = ModelName,
            ModelTemperature = JsonUserModelConfig.Temperature ?? JsonModelConfig.Temperature,
            ModelPrompt = messages.FirstOrDefault(x => x.Role == DBConversationRoles.System)?.Content.Text,
            Messages = messages.Where(x => x.Role != DBConversationRoles.System).ToArray(),
        };
    }
}

[JsonPolymorphic]
[JsonDerivedType(typeof(AdminMessageAssistantItem))]
public record AdminMessageBasicItem
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("parentId")]
    public Guid? ParentId { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }

    [JsonPropertyName("role")]
    public required string Role { get; init; }

    [JsonPropertyName("content")]
    public required MessageContentDto Content { get; init; }

    [JsonPropertyName("childrenIds")]
    public required List<Guid> ChildrenIds { get; init; }

    [JsonPropertyName("assistantChildrenIds")]
    public required List<Guid> AssistantChildrenIds { get; init; }

    public AdminMessageAssistantItem WithAssistantDetails(int duration, int inputTokens, int outputTokens, string inputPrice, string outputPrice, string modelName)
    {
        return new AdminMessageAssistantItem
        {
            Id = Id,
            ParentId = ParentId,
            CreatedAt = CreatedAt,
            Role = Role,
            Content = Content,
            ChildrenIds = ChildrenIds,
            AssistantChildrenIds = AssistantChildrenIds,
            Duration = duration, 
            InputTokens = inputTokens,
            OutputTokens = outputTokens,
            InputPrice = inputPrice,
            OutputPrice = outputPrice,
            ModelName = modelName,
        };
    }
}

public record AdminMessageAssistantItem : AdminMessageBasicItem
{
    [JsonPropertyName("duration")]
    public required int Duration { get; init; }

    [JsonPropertyName("inputTokens")]
    public required int InputTokens { get; init; }

    [JsonPropertyName("outputTokens")]
    public required int OutputTokens { get; init; }

    [JsonPropertyName("inputPrice")]
    public required string InputPrice { get; init; }

    [JsonPropertyName("outputPrice")]
    public required string OutputPrice { get; init; }

    [JsonPropertyName("modelName")]
    public required string ModelName { get; init; }
}

public record AdminMessageItemTemp
{
    public required Guid Id { get; init; }
    public Guid? ParentId { get; init; }
    public string? ModelName { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required int InputTokens { get; init; }
    public required int OutputTokens { get; init; }
    public required decimal InputPrice { get; init; }
    public required decimal OutputPrice { get; init; }
    public required string Role { get; init; }
    public required string ContentText { get; init; }
    public required int Duration { get; init; }

    public static AdminMessageBasicItem[] ToDtos(AdminMessageItemTemp[] temps)
    {
        return temps
            .Select(x =>
            {
                AdminMessageBasicItem basicItem = new()
                {
                    Id = x.Id,
                    ParentId = x.ParentId,
                    CreatedAt = x.CreatedAt,
                    Role = x.Role,
                    Content = MessageContentDto.Parse(x.ContentText),
                    ChildrenIds = temps
                        .Where(v => v.ParentId == x.Id && v.Role == DBConversationRoles.User)
                        .Select(v => v.Id)
                        .ToList(),
                    AssistantChildrenIds = temps
                        .Where(v => v.ParentId == x.ParentId && v.Role == DBConversationRoles.Assistant)
                        .Select(v => v.Id)
                        .ToList(),
                };

                if (x.Role == DBConversationRoles.Assistant)
                {
                    return basicItem.WithAssistantDetails(x.Duration, x.InputTokens, x.OutputTokens, x.InputPrice.ToString(), x.OutputPrice.ToString(), x.ModelName!);
                }
                else
                {
                    return basicItem;
                }
            })
            .ToArray();
    }
}
