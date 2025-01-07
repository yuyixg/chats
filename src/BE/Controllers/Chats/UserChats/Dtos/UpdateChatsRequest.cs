using Chats.BE.DB;
using Chats.BE.Services.UrlEncryption;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.UserChats.Dtos;

public class UpdateChatsRequest
{
    [JsonPropertyName("title")]
    public string? Title { get; set; } = null!;

    [JsonPropertyName("isArchived")]
    public bool? IsArchived { get; set; }

    [JsonPropertyName("isTopMost")]
    public bool? IsTopMost { get; set; }

    [JsonPropertyName("setsLeafMessageId")]
    public bool SetsLeafMessageId { get; set; }

    [JsonPropertyName("leafMessageId")]
    public string? LeafMessageId { get; set; } = null!;

    public DecryptedUpdateChatsRequest Decrypt(IUrlEncryptionService urlEncryptionService)
    {
        return new DecryptedUpdateChatsRequest
        {
            Title = Title,
            IsArchived = IsArchived,
            IsTopMost = IsTopMost,
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

    public bool? IsArchived { get; set; }

    public bool? IsTopMost { get; set; }

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
        if (IsArchived != null)
        {
            chat.IsArchived = IsArchived.Value;
        }
        if (SetsLeafMessageId)
        {
            chat.LeafMessageId = LeafMessageId;
        }
        if (IsTopMost != null)
        {
            chat.IsTopMost = IsTopMost.Value;
        }
    }
}