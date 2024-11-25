using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.IdEncryption;
using System.Text;
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
    public required MessageContentResponse Content { get; init; }

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

    [JsonPropertyName("reasoningTokens")]
    public required int ReasoningTokens { get; init; }

    [JsonPropertyName("duration")]
    public required int Duration { get; init; }

    [JsonPropertyName("firstTokenLatency")]
    public required int FirstTokenLatency { get; init; }

    [JsonPropertyName("modelId")]
    public required short ModelId { get; init; }

    [JsonPropertyName("modelName")]
    public required string? ModelName { get; init; }
}

public record MessageContentRequest
{
    [JsonPropertyName("text")]
    public required string Text { get; init; }

    [JsonPropertyName("image")]
    public List<string>? Image { get; init; }

    public MessageContent[] ToMessageContents()
    {
        return
        [
            MessageContent.FromText(Text),
            ..(Image ?? []).Select(MessageContent.FromImageUrl),
        ];
    }

    public DBMessageSegment[] ToMessageSegments()
    {
        return ToMessageContents().Select(x => x.ToSegment()).ToArray();
    }
}

public record MessageContentResponse
{
    [JsonPropertyName("text")]
    public required string Text { get; init; }

    [JsonPropertyName("image"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public required List<string>? Image { get; init; }

    [JsonPropertyName("error"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public required string? Error { get; init; }

    public static MessageContentResponse FromSegments(DBMessageSegment[] segments)
    {
        Dictionary<DBMessageContentType, byte[][]> groups = segments
            .GroupBy(x => x.ContentType)
            .ToDictionary(k => k.Key, v => v.Select(x => x.Content).ToArray());
        foreach (DBMessageContentType ct in Enum.GetValuesAsUnderlyingType<DBMessageContentType>())
        {
            if (!groups.ContainsKey(ct)) groups[ct] = [];
        }

        return new MessageContentResponse()
        {
            Text = string.Join("\n", groups[DBMessageContentType.Text].Select(Encoding.Unicode.GetString)),
            Image = groups[DBMessageContentType.ImageUrl].Select(Encoding.UTF8.GetString).ToList() switch { [] => null, var x => x },
            Error = string.Join("\n", groups[DBMessageContentType.Error].Select(Encoding.UTF8.GetString)) switch { "" => null, var x => x }
        };
    }
}

public record ChatMessageTemp
{
    public required long Id { get; init; }
    public required long? ParentId { get; init; }
    public required DBChatRole Role { get; init; }
    public required DBMessageSegment[] Content { get; init; }
    public required int? InputTokens { get; init; }
    public required int? OutputTokens { get; init; }
    public required int? ReasoningTokens { get; init; }
    public required decimal? InputPrice { get; init; }
    public required decimal? OutputPrice { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required int? Duration { get; init; }
    public required int? FirstTokenLatency { get; init; }
    public required short? ModelId { get; init; }
    public required string? ModelName { get; init; }

    public MessageDto ToDto(IIdEncryptionService idEncryption)
    {
        if (ModelId == null)
        {
            return new RequestMessageDto()
            {
                Id = idEncryption.Encrypt(Id),
                ParentId = ParentId != null ? idEncryption.Encrypt(ParentId.Value) : null, 
                Role = Role.ToString().ToLowerInvariant(),
                Content = MessageContentResponse.FromSegments(Content),
                CreatedAt = CreatedAt
            };
        }
        else
        {
            return new ResponseMessageDto()
            {
                Id = idEncryption.Encrypt(Id),
                ParentId = ParentId != null ? idEncryption.Encrypt(ParentId.Value) : null, 
                Role = Role.ToString().ToLowerInvariant(),
                Content = MessageContentResponse.FromSegments(Content),
                CreatedAt = CreatedAt,
                InputTokens = InputTokens!.Value,
                OutputTokens = OutputTokens!.Value,
                InputPrice = InputPrice!.Value,
                OutputPrice = OutputPrice!.Value,
                ReasoningTokens = ReasoningTokens!.Value,
                Duration = Duration!.Value,
                FirstTokenLatency = FirstTokenLatency!.Value,
                ModelId = ModelId!.Value,
                ModelName = ModelName
            };
        }
    }
}