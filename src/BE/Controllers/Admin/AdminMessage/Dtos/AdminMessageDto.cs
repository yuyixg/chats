using Chats.BE.Controllers.Chats.Conversations.Dtos;
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
    public required JsonUserModelConfig UserModelConfigText { get; init; }

    public JsonModelConfig JsonModelConfig => JsonSerializer.Deserialize<JsonModelConfig>(ModelConfigText)!;

    public AdminMessageDto ToDto(AdminMessageBasicItem[] messages)
    {
        return new AdminMessageDto
        {
            Name = Name,
            ModelName = ModelName,
            ModelTemperature = UserModelConfigText.Temperature ?? JsonModelConfig.Temperature,
            ModelPrompt = messages.FirstOrDefault(x => x.Role.Equals(DBConversationRole.System.ToString(), StringComparison.OrdinalIgnoreCase))?.Content.Text,
            Messages = messages.Where(x => !x.Role.Equals(DBConversationRole.System.ToString(), StringComparison.OrdinalIgnoreCase)).ToArray(),
        };
    }
}

[JsonPolymorphic]
[JsonDerivedType(typeof(AdminMessageAssistantItem))]
public record AdminMessageBasicItem
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("parentId")]
    public string? ParentId { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }

    [JsonPropertyName("role")]
    public required string Role { get; init; }

    [JsonPropertyName("content")]
    public required MessageContentDto Content { get; init; }

    [JsonPropertyName("childrenIds")]
    public required List<string> ChildrenIds { get; init; }

    [JsonPropertyName("assistantChildrenIds")]
    public required List<string> AssistantChildrenIds { get; init; }

    public AdminMessageAssistantItem WithAssistantDetails(int duration, int inputTokens, int outputTokens, decimal inputPrice, decimal outputPrice, string modelName)
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
            InputPrice = inputPrice.ToString(),
            OutputPrice = outputPrice.ToString(),
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
    public required long Id { get; init; }
    public required long? ParentId { get; init; }
    public string? ModelName { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required DBConversationRole Role { get; init; }
    public required DBMessageSegment[] Content { get; init; }
    public required int? InputTokens { get; init; }
    public required int? OutputTokens { get; init; }
    public required decimal? InputPrice { get; init; }
    public required decimal? OutputPrice { get; init; }
    public required int? Duration { get; init; }

    public static AdminMessageBasicItem[] ToDtos(AdminMessageItemTemp[] temps)
    {
        return temps
            .Select(x =>
            {
                AdminMessageBasicItem basicItem = new()
                {
                    Id = x.Id.ToString(),
                    ParentId = x.ParentId?.ToString(),
                    CreatedAt = x.CreatedAt,
                    Role = x.Role.ToString().ToLowerInvariant(),
                    Content = MessageContentDto.FromSegments(x.Content),
                    ChildrenIds = temps
                        .Where(v => v.ParentId == x.Id && v.Role == DBConversationRole.User)
                        .Select(v => v.Id.ToString())
                        .ToList(),
                    AssistantChildrenIds = temps
                        .Where(v => v.ParentId == x.ParentId && v.Role == DBConversationRole.Assistant)
                        .Select(v => v.Id.ToString())
                        .ToList(),
                };

                if (x.Role == DBConversationRole.Assistant)
                {
                    return basicItem.WithAssistantDetails(x.Duration!.Value, x.InputTokens!.Value, x.OutputTokens!.Value, x.InputPrice!.Value, x.OutputPrice!.Value, x.ModelName!);
                }
                else
                {
                    return basicItem;
                }
            })
            .ToArray();
    }
}
