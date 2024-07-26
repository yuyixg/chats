using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.Messages;

[Route("api/messages"), Authorize]
public class MessagesController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<MessageDto[]>> GetMessages([FromQuery] Guid chatId, CancellationToken cancellationToken)
    {
        MessageDto[] messages = await db.ChatMessages
            .Where(m => m.ChatId == chatId && m.UserId == currentUser.Id && m.Role != DBConversationRoles.System)
            .Select(x => new ChatMessageTemp()
            {
                Id = x.Id,
                ParentId = x.ParentId,
                Role = x.Role,
                Content = x.Messages,
                InputTokens = x.InputTokens,
                OutputTokens = x.OutputTokens,
                InputPrice = x.InputPrice,
                OutputPrice = x.OutputPrice,
                CreatedAt = x.CreatedAt,
                Duration = x.Duration,
                ModelId = x.ChatModelId,
                ModelName = x.ChatModel!.Name
            })
            .OrderBy(x => x.CreatedAt)
            .AsAsyncEnumerable()
            .Select(x => x.ToDto())
            .ToArrayAsync(cancellationToken);

        return Ok(messages);
    }
}
