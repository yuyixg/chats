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
                InputTokens = x.Usage!.InputTokens,
                OutputTokens = x.Usage.OutputTokens,
                InputPrice = x.Usage.InputCost,
                OutputPrice = x.Usage.OutputCost,
                ReasoningTokens = x.Usage.ReasoningTokens,
                Duration = x.Usage.TotalDurationMs - x.Usage.PreprocessDurationMs,
                FirstTokenLatency = x.Usage.FirstResponseDurationMs,
                ModelId = x.Usage.UserModel.ModelId,
                ModelName = x.Usage.UserModel.Model.Name
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
}
