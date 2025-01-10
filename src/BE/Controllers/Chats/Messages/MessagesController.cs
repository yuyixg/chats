using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Infrastructure;
using Chats.BE.Services.ChatServices;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.Messages;

[Route("api/messages"), Authorize]
public class MessagesController(ChatsDB db, CurrentUser currentUser, IUrlEncryptionService urlEncryption) : ControllerBase
{
    [HttpGet("{chatId}")]
    public async Task<ActionResult<MessageDto[]>> GetMessages(string chatId, [FromServices] FileUrlProvider fup, CancellationToken cancellationToken)
    {
        MessageDto[] messages = await db.Messages
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentBlob)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentFile).ThenInclude(x => x!.File).ThenInclude(x => x.FileService)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentText)
            .Where(m => m.ChatId == urlEncryption.DecryptChatId(chatId) && m.Chat.UserId == currentUser.Id && m.ChatRoleId != (byte)DBChatRole.System)
            .Select(x => new ChatMessageTemp()
            {
                Id = x.Id,
                ParentId = x.ParentId,
                Role = (DBChatRole)x.ChatRoleId,
                Content = x.MessageContents
                    .OrderBy(x => x.Id)
                    .ToArray(),
                CreatedAt = x.CreatedAt,
                SpanId = x.SpanId,
                Usage = x.MessageResponse!.Usage == null ? null : new ChatMessageTempUsage()
                {
                    InputTokens = x.MessageResponse.Usage.InputTokens,
                    OutputTokens = x.MessageResponse.Usage.OutputTokens,
                    InputPrice = x.MessageResponse.Usage.InputCost,
                    OutputPrice = x.MessageResponse.Usage.OutputCost,
                    ReasoningTokens = x.MessageResponse.Usage.ReasoningTokens,
                    Duration = x.MessageResponse.Usage.TotalDurationMs - x.MessageResponse.Usage.PreprocessDurationMs,
                    FirstTokenLatency = x.MessageResponse.Usage.FirstResponseDurationMs,
                    ModelId = x.MessageResponse.Usage.UserModel.ModelId,
                    ModelName = x.MessageResponse.Usage.UserModel.Model.Name,
                    ModelProviderId = x.MessageResponse.Usage.UserModel.Model.ModelKey.ModelProviderId,
                    Reaction = x.MessageResponse.ReactionId,
                },
            })
            .OrderBy(x => x.CreatedAt)
            .Select(x => x.ToDto(urlEncryption, fup))
            .ToArrayAsync(cancellationToken);

        return Ok(messages);
    }

    [HttpGet("{chatId}/system-prompt")]
    public async Task<ActionResult<string?>> GetChatSystemPrompt(string chatId, CancellationToken cancellationToken)
    {
        MessageContent? content = await db.Messages
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentText)
            .Where(m => m.ChatId == urlEncryption.DecryptChatId(chatId) && m.ChatRoleId == (byte)DBChatRole.System)
            .Select(x => x.MessageContents.First(x => x.ContentTypeId == (byte)DBMessageContentType.Text))
            .FirstOrDefaultAsync(cancellationToken);

        if (content == null)
        {
            return Ok(null);
        }

        return Ok(content.ToString());
    }

    [HttpPut("{encryptedMessageId}/reaction/up")]
    public async Task<ActionResult> ReactionUp(string encryptedMessageId, CancellationToken cancellationToken)
    {
        return await ReactionPrivate(encryptedMessageId, reactionId: true, cancellationToken);
    }

    [HttpPut("{encryptedMessageId}/reaction/down")]
    public async Task<ActionResult> ReactionDown(string encryptedMessageId, CancellationToken cancellationToken)
    {
        return await ReactionPrivate(encryptedMessageId, reactionId: false, cancellationToken);
    }

    [HttpPut("{encryptedMessageId}/reaction/clear")]
    public async Task<ActionResult> ReactionClear(string encryptedMessageId, CancellationToken cancellationToken)
    {
        return await ReactionPrivate(encryptedMessageId, reactionId: null, cancellationToken);
    }

    private async Task<ActionResult> ReactionPrivate(string encryptedMessageId, bool? reactionId, CancellationToken cancellationToken)
    {
        long messageId = urlEncryption.DecryptMessageId(encryptedMessageId);
        Message? message = await db.Messages
            .Include(x => x.MessageResponse)
            .Include(x => x.Chat)
            .FirstOrDefaultAsync(x => x.Id == messageId, cancellationToken);

        if (message == null || message.MessageResponse == null)
        {
            return NotFound();
        }

        if (message.Chat.UserId != currentUser.Id)
        {
            return Forbid();
        }

        message.MessageResponse.ReactionId = reactionId;
        message.Chat.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpPut("{encryptedMessageId}/edit")]
    public async Task<ActionResult> EditMessage(string encryptedMessageId, [FromBody] MessageContentRequest content,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        long messageId = urlEncryption.DecryptMessageId(encryptedMessageId);
        Message? message = await db.Messages
            .Include(x => x.MessageContents)
            .Include(x => x.Chat)
            .FirstOrDefaultAsync(x => x.Id == messageId, cancellationToken);
        if (message == null)
        {
            return NotFound();
        }
        if (message.Chat.UserId != currentUser.Id)
        {
            return Forbid();
        }

        message.MessageContents = await content.ToMessageContents(fup, cancellationToken);
        message.Chat.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpDelete("{encryptedMessageId}")]
    public async Task<ActionResult<string[]>> DeleteMessage(string encryptedMessageId, bool recursive, CancellationToken cancellationToken)
    {
        long messageId = urlEncryption.DecryptMessageId(encryptedMessageId);
        Message? message = await db.Messages
            .Include(x => x.Chat)
            .Include(x => x.InverseParent)
            .FirstOrDefaultAsync(x => x.Id == messageId, cancellationToken);
        if (message == null)
        {
            return NotFound();
        }
        if (message.Chat.UserId != currentUser.Id)
        {
            return Forbid();
        }

        if (message.InverseParent.Count > 0)
        {
            if (!recursive)
            {
                return BadRequest("Cannot delete a message with replies");
            }

            List<long> messageIdsQueue = [messageId];
            List<long> toDeleteMessageIds = [];
            while (messageIdsQueue.Count > 0)
            {
                toDeleteMessageIds.AddRange(messageIdsQueue);
                messageIdsQueue = await db.Messages
                        .Where(x => x.ParentId != null && messageIdsQueue.Contains(x.ParentId.Value))
                        .Select(x => x.Id)
                        .ToListAsync(cancellationToken);
            }
            await db.Messages
                .Where(x => toDeleteMessageIds.Contains(x.Id))
                .ExecuteDeleteAsync(cancellationToken);
            return Ok(toDeleteMessageIds.Select(urlEncryption.EncryptMessageId));
        }
        else
        {
            db.Messages.Remove(message);
            await db.SaveChangesAsync(cancellationToken);
            return Ok(new string[] { urlEncryption.EncryptMessageId(messageId) });
        }
    }
}
