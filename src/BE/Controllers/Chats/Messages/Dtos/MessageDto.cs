using Chats.BE.Services;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Messages.Dtos;

[JsonPolymorphic]
[JsonDerivedType(typeof(RequestMessageDto))]
[JsonDerivedType(typeof(ResponseMessageDto))]
public abstract record MessageDto
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("parentId")]
    public required Guid? ParentId { get; init; }

    [JsonPropertyName("role")]
    public required string Role { get; init; }

    [JsonPropertyName("content")]
    public required MessageContentDto Content { get; init; }

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; init; }
}

public record RequestMessageDto : MessageDto;

public record ResponseMessageDto : MessageDto
{
    [JsonPropertyName("inputTokens")]
    public required int InputTokens { get; init; }

    [JsonPropertyName("outputTokens")]
    public required int OutputTokens { get; init; }

    [JsonPropertyName("inputPrice")]
    public required decimal InputPrice { get; init; }

    [JsonPropertyName("outputPrice")]
    public required decimal OutputPrice { get; init; }

    [JsonPropertyName("duration")]
    public required int Duration { get; init; }

    [JsonPropertyName("modelId")]
    public required Guid ModelId { get; init; }

    [JsonPropertyName("modelName")]
    public required string? ModelName { get; init; }
}

public record MessageContentDto
{
    [JsonPropertyName("text")]
    public required string Text { get; init; }

    [JsonPropertyName("image"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<string>? Image { get; init; }

    public static MessageContentDto FromText(string text)
    {
        return new MessageContentDto
        {
            Text = text
        };
    }

    public static MessageContentDto Parse(string rawText)
    {
        return JsonSerializer.Deserialize<MessageContentDto>(rawText)!;
    }

    public string ToJson()
    {
        return JSON.Serialize(this);
    }
}

public record ChatMessageTemp
{
    public required Guid Id { get; init; }
    public required Guid? ParentId { get; init; }
    public required string Role { get; init; }
    public required string Content { get; init; }
    public required int InputTokens { get; init; }
    public required int OutputTokens { get; init; }
    public required decimal InputPrice { get; init; }
    public required decimal OutputPrice { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required int Duration { get; init; }
    public required Guid? ModelId { get; init; }
    public required string? ModelName { get; init; }

    public MessageDto ToDto()
    {
        if (ModelId == null)
        {
            return new RequestMessageDto()
            {
                Id = Id,
                ParentId = ParentId,
                Role = Role,
                Content = JsonSerializer.Deserialize<MessageContentDto>(Content)!,
                CreatedAt = CreatedAt
            };
        }
        else
        {
            return new ResponseMessageDto()
            {
                Id = Id,
                ParentId = ParentId,
                Role = Role,
                Content = JsonSerializer.Deserialize<MessageContentDto>(Content)!,
                CreatedAt = CreatedAt,
                InputTokens = InputTokens,
                OutputTokens = OutputTokens,
                InputPrice = InputPrice,
                OutputPrice = OutputPrice,
                Duration = Duration,
                ModelId = ModelId!.Value,
                ModelName = ModelName
            };
        }
    }
}