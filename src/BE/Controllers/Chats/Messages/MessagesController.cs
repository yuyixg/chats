using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.IdEncryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.Messages;

[Route("api/messages"), Authorize]
public class MessagesController(ChatsDB db, CurrentUser currentUser, IIdEncryptionService idEncryption) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<MessageDto[]>> GetMessages([FromQuery] string chatId, CancellationToken cancellationToken)
    {
        MessageDto[] messages = await db.Message2s
            .Where(m => m.ConversationId == idEncryption.DecryptAsInt32(chatId) && m.Conversation.UserId == currentUser.Id && m.ChatRoleId != (byte)DBConversationRole.System)
            .Select(x => new ChatMessageTemp()
            {
                Id = x.Id,
                ParentId = x.ParentId,
                Role = (DBConversationRole)x.ChatRoleId,
                Content = x.MessageContent2s
                    .OrderBy(x => x.Id)
                    .Select(x => new DBMessageSegment
                    {
                        ContentType = (DBMessageContentType)x.ContentTypeId,
                        Content = x.Content
                    })
                    .ToArray(),
                CreatedAt = x.CreatedAt,
                InputTokens = x.Usage!.InputTokenCount,
                OutputTokens = x.Usage.OutputTokenCount,
                InputPrice = x.Usage.InputCost,
                OutputPrice = x.Usage.OutputCost,
                Duration = x.Usage.DurationMs,
                ModelId = x.Usage.UserModel.ModelId,
                ModelName = x.Usage.UserModel.Model.Name
            })
            .OrderBy(x => x.CreatedAt)
            .AsAsyncEnumerable()
            .Select(x => x.ToDto(idEncryption))
            .ToArrayAsync(cancellationToken);

        return Ok(messages);
    }

    [HttpGet("v2")]
    public async Task<ActionResult<MessageDto[]>> GetMessagesV2([FromQuery] string chatId, CancellationToken cancellationToken)
    {
        MessageDto[] messages = await db.Message2s
            .Where(m => m.ConversationId == idEncryption.DecryptAsInt32(chatId) && m.Conversation.UserId == currentUser.Id)
            .Select(x => new ChatMessageTemp()
            {
                Id = x.Id,
                ParentId = x.ParentId,
                Role = (DBConversationRole)x.ChatRoleId,
                Content = x.MessageContent2s
                    .OrderBy(x => x.Id)
                    .Select(x => new DBMessageSegment
                    {
                        ContentType = (DBMessageContentType)x.ContentTypeId,
                        Content = x.Content
                    })
                    .ToArray(),
                CreatedAt = x.CreatedAt,
                InputTokens = x.Usage!.InputTokenCount,
                OutputTokens = x.Usage.OutputTokenCount,
                InputPrice = x.Usage.InputCost,
                OutputPrice = x.Usage.OutputCost,
                Duration = x.Usage.DurationMs,
                ModelId = x.Usage.UserModel.ModelId,
                ModelName = x.Usage.UserModel.Model.Name
            })
            .OrderBy(x => x.CreatedAt)
            .AsAsyncEnumerable()
            .Select(x => x.ToDto(idEncryption))
            .ToArrayAsync(cancellationToken);

        return Ok(messages);
    }
}
