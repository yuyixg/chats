using Chats.BE.DB;
using Chats.BE.Services.UrlEncryption;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.UserChats.Dtos;

public class UpdateChatsRequest
{
    [JsonPropertyName("title")]
    public string? Title { get; set; } = null!;

    [JsonPropertyName("isDeleted")]
    public bool? IsDeleted { get; set; }

    [JsonPropertyName("setsLeafMessageId")]
    public bool SetsLeafMessageId { get; set; }

    [JsonPropertyName("leafMessageId")]
    public string? LeafMessageId { get; set; } = null!;

    public DecryptedUpdateChatsRequest Decrypt(IUrlEncryptionService urlEncryptionService)
    {
        return new DecryptedUpdateChatsRequest
        {
            Title = Title,
            IsDeleted = IsDeleted,
            SetsLeafMessageId = SetsLeafMessageId,
            LeafMessageId = LeafMessageId switch
            {
                null => null,
                _ => urlEncryptionService.DecryptMessageId(LeafMessageId)
            },
        };
    }
}


public class DecryptedUpdateChatsRequest
{
    public string? Title { get; set; } = null!;

    public bool? IsDeleted { get; set; }

    public bool SetsLeafMessageId { get; set; }

    public long? LeafMessageId { get; set; } = null!;

    public async Task<string?> Validate(ChatsDB db, int chatId)
    {
        if (Title != null && Title.Length > 50)
        {
            return "Title is too long";
        }

        if (SetsLeafMessageId && LeafMessageId != null)
        {
            if (!await db.Messages.AnyAsync(x => x.Id == LeafMessageId && x.ChatId == chatId))
            {
                return "Leaf message not found";
            }
        }
        return null;
    }

    public void ApplyToChats(Chat chat)
    {
        if (Title != null)
        {
            chat.Title = Title;
        }
        if (IsDeleted != null)
        {
            chat.IsArchived = IsDeleted.Value;
        }
        if (SetsLeafMessageId)
        {
            chat.LeafMessageId = LeafMessageId;
        }
    }
}