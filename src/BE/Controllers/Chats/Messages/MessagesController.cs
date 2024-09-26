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
        MessageDto[] messages = await db.Messages
            .Where(m => m.ConversationId == idEncryption.DecryptAsInt32(chatId) && m.Conversation.UserId == currentUser.Id && m.ChatRoleId != (byte)DBConversationRole.System)
            .Select(x => new ChatMessageTemp()
            {
                Id = x.Id,
                ParentId = x.ParentId,
                Role = (DBConversationRole)x.ChatRoleId,
                Content = x.MessageContents
                    .OrderBy(x => x.Id)
                    .Select(x => new DBMessageSegment
                    {
                        ContentType = (DBMessageContentType)x.ContentTypeId,
                        Content = x.Content
                    })
                    .ToArray(),
                CreatedAt = x.CreatedAt,
                InputTokens = x.MessageResponse!.InputTokenCount,
                OutputTokens = x.MessageResponse.OutputTokenCount,
                InputPrice = x.MessageResponse.InputCost,
                OutputPrice = x.MessageResponse.OutputCost,
                Duration = x.MessageResponse.DurationMs,
                ModelId = x.MessageResponse.ChatModelId,
                ModelName = x.MessageResponse.ChatModel.Name
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
        MessageDto[] messages = await db.Messages
            .Where(m => m.ConversationId == idEncryption.DecryptAsInt32(chatId) && m.Conversation.UserId == currentUser.Id)
            .Select(x => new ChatMessageTemp()
            {
                Id = x.Id,
                ParentId = x.ParentId,
                Role = (DBConversationRole)x.ChatRoleId,
                Content = x.MessageContents
                    .OrderBy(x => x.Id)
                    .Select(x => new DBMessageSegment
                    {
                        ContentType = (DBMessageContentType)x.ContentTypeId,
                        Content = x.Content
                    })
                    .ToArray(),
                CreatedAt = x.CreatedAt,
                InputTokens = x.MessageResponse!.InputTokenCount,
                OutputTokens = x.MessageResponse.OutputTokenCount,
                InputPrice = x.MessageResponse.InputCost,
                OutputPrice = x.MessageResponse.OutputCost,
                Duration = x.MessageResponse.DurationMs,
                ModelId = x.MessageResponse.ChatModelId,
                ModelName = x.MessageResponse.ChatModel.Name
            })
            .OrderBy(x => x.CreatedAt)
            .AsAsyncEnumerable()
            .Select(x => x.ToDto(idEncryption))
            .ToArrayAsync(cancellationToken);

        return Ok(messages);
    }
}
