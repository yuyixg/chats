using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Services;
using Chats.BE.Services.Conversations;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Messages.Dtos;

[JsonPolymorphic]
[JsonDerivedType(typeof(RequestMessageDto))]
[JsonDerivedType(typeof(ResponseMessageDto))]
public abstract record MessageDto
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("parentId")]
    public required string? ParentId { get; init; }

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

    public MessageContent[] ToMessageContents()
    {
        return 
        [
            MessageContent.FromText(Text), 
            ..(Image ?? []).Select(MessageContent.FromImageUrl)
        ];
    }

    public static MessageContentDto FromSegments(DBMessageSegment[] segments)
    {
        return new MessageContentDto()
        {
            Text = string.Join("\n", segments.Where(x => x.ContentType == DBMessageContentType.Text).Select(x => Encoding.Unicode.GetString(x.Content))),
            Image = segments.Where(x => x.ContentType == DBMessageContentType.ImageUrl).Select(x => Encoding.UTF8.GetString(x.Content)).ToList()
        };
    }
    
    public DBMessageSegment[] ToMessageSegments()
    {
        return ToMessageContents().Select(x => x.ToSegment()).ToArray();
    }
}

public record ChatMessageTemp
{
    public required long Id { get; init; }
    public required long? ParentId { get; init; }
    public required DBConversationRole Role { get; init; }
    public required DBMessageSegment[] Content { get; init; }
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
                Id = Id.ToString(),
                ParentId = ParentId?.ToString(),
                Role = Role.ToString().ToLowerInvariant(),
                Content = MessageContentDto.FromSegments(Content),
                CreatedAt = CreatedAt
            };
        }
        else
        {
            return new ResponseMessageDto()
            {
                Id = Id.ToString(),
                ParentId = ParentId?.ToString(),
                Role = Role.ToString().ToLowerInvariant(),
                Content = MessageContentDto.FromSegments(Content),
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