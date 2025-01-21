using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Models;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.ML.Tokenizers;
using Chats.BE.Services;

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
                Edited = x.Edited,
                Usage = x.Usage == null ? null : new ChatMessageTempUsage()
                {
                    InputTokens = x.Usage.InputTokens,
                    OutputTokens = x.Usage.OutputTokens,
                    InputPrice = x.Usage.InputCost,
                    OutputPrice = x.Usage.OutputCost,
                    ReasoningTokens = x.Usage.ReasoningTokens,
                    Duration = x.Usage.TotalDurationMs - x.Usage.PreprocessDurationMs,
                    FirstTokenLatency = x.Usage.FirstResponseDurationMs,
                    ModelId = x.Usage.UserModel.ModelId,
                    ModelName = x.Usage.UserModel.Model.Name,
                    ModelProviderId = x.Usage.UserModel.Model.ModelKey.ModelProviderId,
                    Reaction = x.ReactionId,
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

        message.ReactionId = reactionId;
        message.Chat.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpPut("{encryptedMessageId}/edit-in-place")]
    public async Task<ActionResult> EditMessageInPlace(string encryptedMessageId, [FromBody] MessageContentRequest content,
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

        message.MessageContents.Clear();
        foreach (MessageContent c in await content.ToMessageContents(fup, cancellationToken))
        {
            message.MessageContents.Add(c);
        }
        message.Chat.UpdatedAt = DateTime.UtcNow;
        message.Edited = true;
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpPut("{encryptedMessageId}/edit-and-save-new")]
    public async Task<ActionResult<RequestMessageDto>> EditAndSaveNew(string encryptedMessageId, [FromBody] MessageContentRequest content,
    [FromServices] FileUrlProvider fup,
    [FromServices] ClientInfoManager clientInfoManager,
    CancellationToken cancellationToken)
    {
        long messageId = urlEncryption.DecryptMessageId(encryptedMessageId);
        Message? message = await db.Messages
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

        Message newMessage = new()
        {
            Edited = true,
            CreatedAt = DateTime.UtcNow,
            SpanId = message.SpanId,
            ChatId = message.ChatId,
            ParentId = message.ParentId,
            ChatRoleId = message.ChatRoleId,
            ChatRole = message.ChatRole,
            MessageContents = await content.ToMessageContents(fup, cancellationToken),
        };
        if (message.Usage != null)
        {
            newMessage.Usage = new UserModelUsage()
            {
                UserModelId = message.Usage.UserModelId,
                FinishReasonId = (byte)DBFinishReason.Success,
                SegmentCount = 1,
                InputTokens = message.Usage.InputTokens,
                OutputTokens = TiktokenTokenizer.CreateForEncoding("cl100k_base").CountTokens(content.Text),
                ReasoningTokens = 0,
                IsUsageReliable = false,
                PreprocessDurationMs = 0,
                FirstResponseDurationMs = 0,
                PostprocessDurationMs = 0,
                TotalDurationMs = 0,
                InputCost = 0,
                OutputCost = 0,
                BalanceTransactionId = null,
                UsageTransactionId = null,
                ClientInfo = await clientInfoManager.GetClientInfo(cancellationToken),
                CreatedAt = DateTime.UtcNow,
            };
        }
        db.Messages.Add(newMessage);
        message.Chat.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(RequestMessageDto.FromDB(newMessage, fup, urlEncryption));
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
