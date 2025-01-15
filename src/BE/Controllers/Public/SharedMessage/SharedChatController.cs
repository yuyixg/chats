using Chats.BE.Controllers.Admin.AdminMessage;
using Chats.BE.Controllers.Chats.UserChats.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.SharedMessage;

[Route("api/public/chat-share")]
public class SharedChatController(ChatsDB db) : ControllerBase
{
    [HttpGet("{encryptedChatShareId}")]
    public async Task<ActionResult<ChatsResponseWithMessage>> GetSharedChat(string encryptedChatShareId,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        int chatShareId = idEncryption.DecryptChatShareId(encryptedChatShareId);
        ChatShare? chatShare = await db.ChatShares.FirstOrDefaultAsync(x => x.Id == chatShareId, cancellationToken);
        if (chatShare == null || chatShare.ExpiresAt < DateTime.UtcNow)
        {
            return NotFound();
        }

        ChatsResponseWithMessage data = (await AdminMessageController.InternalGetChatWithMessages(db, idEncryption, chatShare.ChatId, fup, cancellationToken))!;
        data.Messages = data.Messages.Where(x => x.CreatedAt <= chatShare.SnapshotTime).ToArray();
        return Ok(data);
    }

    [HttpPut("{encryptedChatShareId}"), Authorize]
    public async Task<ActionResult<ChatShareDto>> UpdateShared(string encryptedChatShareId,
        DateTimeOffset validBefore,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] CurrentUser user,
        CancellationToken cancellationToken)
    {
        int chatShareId = idEncryption.DecryptChatShareId(encryptedChatShareId);
        ChatShare? chatShare = await db.ChatShares.FirstOrDefaultAsync(x => x.Id == chatShareId, cancellationToken);
        if (chatShare == null)
        {
            return NotFound();
        }
        bool isChatOwner = await db.Chats.AnyAsync(x => x.Id == chatShare.ChatId && x.UserId == user.Id, cancellationToken);
        if (!isChatOwner)
        {
            return Forbid();
        }
        chatShare.ExpiresAt = validBefore;
        chatShare.SnapshotTime = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(ChatShareDto.FromDB(chatShare, idEncryption));
    }

    [HttpDelete("{encryptedChatShareId}"), Authorize]
    public async Task<ActionResult> DeleteShared(string encryptedChatShareId,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] CurrentUser user,
        CancellationToken cancellationToken)
    {
        int chatShareId = idEncryption.DecryptChatShareId(encryptedChatShareId);
        ChatShare? chatShare = await db.ChatShares
            .Include(x => x.Chat)
            .FirstOrDefaultAsync(x => x.Id == chatShareId, cancellationToken);
        if (chatShare == null)
        {
            return NotFound();
        }
        bool isChatOwner = chatShare.Chat.UserId == user.Id;
        if (!isChatOwner)
        {
            return Forbid();
        }
        db.ChatShares.Remove(chatShare);
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }
}
