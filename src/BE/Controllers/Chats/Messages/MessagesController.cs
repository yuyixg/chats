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
                InputTokens = x.MessageResponse2!.InputTokenCount,
                OutputTokens = x.MessageResponse2.OutputTokenCount,
                InputPrice = x.MessageResponse2.InputCost,
                OutputPrice = x.MessageResponse2.OutputCost,
                Duration = x.MessageResponse2.DurationMs,
                ModelId = x.MessageResponse2.ChatModelId,
                ModelName = x.MessageResponse2.ChatModel.Name
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
                InputTokens = x.MessageResponse2!.InputTokenCount,
                OutputTokens = x.MessageResponse2.OutputTokenCount,
                InputPrice = x.MessageResponse2.InputCost,
                OutputPrice = x.MessageResponse2.OutputCost,
                Duration = x.MessageResponse2.DurationMs,
                ModelId = x.MessageResponse2.ModelId,
                ModelName = x.MessageResponse2.Model.Name
            })
            .OrderBy(x => x.CreatedAt)
            .AsAsyncEnumerable()
            .Select(x => x.ToDto(idEncryption))
            .ToArrayAsync(cancellationToken);

        return Ok(messages);
    }
}
