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
    [HttpGet("{chatId}")]
    public async Task<ActionResult<MessageDto[]>> GetMessages(string chatId, CancellationToken cancellationToken)
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
            .AsAsyncEnumerable()
            .Select(x => x.ToDto(idEncryption))
            .ToArrayAsync(cancellationToken);

        return Ok(messages);
    }

    [HttpGet("{chatId}/system-prompt")]
    public async Task<ActionResult<string?>> GetChatSystemPrompt(string chatId, CancellationToken cancellationToken)
    {
        DBMessageSegment? content = await db.Messages
            .Where(m => m.ConversationId == idEncryption.DecryptAsInt32(chatId) && m.ChatRoleId == (byte)DBConversationRole.System)
            .Select(x => x.MessageContents
                .Select(x => new DBMessageSegment()
                {
                    Content = x.Content,
                    ContentType = (DBMessageContentType)x.ContentTypeId,
                })
                .First()
            )
            .FirstOrDefaultAsync(cancellationToken);

        if (content == null)
        {
            return Ok(null);
        }

        return Ok(content.ToString());
    }
}
