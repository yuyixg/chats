using Chats.BE.Services.UrlEncryption;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.UserChats.Dtos;

public record EncryptedMoveChatGroupRequest
{
    [JsonPropertyName("groupId")]
    public required string GroupId { get; init; }

    [JsonPropertyName("beforeGroupId")]
    public required string? BeforeGroupId { get; init; }

    [JsonPropertyName("afterGroupId")]
    public required string? AfterGroupId { get; init; }

    public MoveChatGroupRequest Decrypt(IUrlEncryptionService urlEncryption)
    {
        return new MoveChatGroupRequest
        {
            GroupId = urlEncryption.DecryptChatGroupId(GroupId),
            BeforeGroupId = urlEncryption.DecryptChatGroupIdOrNull(BeforeGroupId),
            AfterGroupId = urlEncryption.DecryptChatGroupIdOrNull(AfterGroupId),
        };
    }
}

public record MoveChatGroupRequest
{
    public required int GroupId { get; init; }

    public required int? BeforeGroupId { get; init; }

    public required int? AfterGroupId { get; init; }
}