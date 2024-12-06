using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Services.ChatServices;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
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

    [JsonPropertyName("fileIds")]
    public List<string>? FileIds { get; init; }

    public MessageContent[] ToMessageContents(IUrlEncryptionService idEncryptionService)
    {
        return
        [
            MessageContent.FromText(Text),
            ..(FileIds ?? []).Select(x => MessageContent.FromFileId(idEncryptionService.DecryptFileId(x))),
        ];
    }
}

public record MessageContentResponse
{
    [JsonPropertyName("text")]
    public required string Text { get; init; }

    [JsonPropertyName("fileIds"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public required FileDto[]? FileIds { get; init; }

    [JsonPropertyName("error"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public required string? Error { get; init; }

    public static MessageContentResponse FromSegments(MessageContent[] segments, FileUrlProvider fup)
    {
        Dictionary<DBMessageContentType, MessageContent[]> groups = segments
            .GroupBy(x => (DBMessageContentType)x.ContentTypeId)
            .ToDictionary(k => k.Key, v => v.Select(x => x).ToArray());
        foreach (DBMessageContentType ct in Enum.GetValuesAsUnderlyingType<DBMessageContentType>())
        {
            if (!groups.ContainsKey(ct)) groups[ct] = [];
        }

        return new MessageContentResponse()
        {
            Text = string.Join("\n", groups[DBMessageContentType.Text].Select(x => x.ToString())),
            FileIds = groups[DBMessageContentType.FileId]
                .Select(x => fup.CreateFileDto(x.MessageContentFile!.File))
                .ToArray() switch 
                {
                    [] => null,
                    var x => x
                },
            Error = string.Join("\n", groups[DBMessageContentType.Error].Select(x => x.ToString())) switch { "" => null, var x => x }
        };
    }
}

public record FileDto
{
    public required string Id { get; init; }

    public required Uri Url { get; init; }
}

public record ChatMessageTemp
{
    public required long Id { get; init; }
    public required long? ParentId { get; init; }
    public required DBChatRole Role { get; init; }
    public required MessageContent[] Content { get; init; }
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

    public MessageDto ToDto(IUrlEncryptionService urlEncryption, FileUrlProvider fup)
    {
        if (ModelId == null)
        {
            return new RequestMessageDto()
            {
                Id = urlEncryption.EncryptMessageId(Id),
                ParentId = ParentId != null ? urlEncryption.EncryptMessageId(ParentId.Value) : null, 
                Role = Role.ToString().ToLowerInvariant(),
                Content = MessageContentResponse.FromSegments(Content, fup),
                CreatedAt = CreatedAt
            };
        }
        else
        {
            return new ResponseMessageDto()
            {
                Id = urlEncryption.EncryptMessageId(Id),
                ParentId = ParentId != null ? urlEncryption.EncryptMessageId(ParentId.Value) : null, 
                Role = Role.ToString().ToLowerInvariant(),
                Content = MessageContentResponse.FromSegments(Content, fup),
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