using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.Controllers.Public.PublicMessage.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.PublicMessage;

[Route("api/public/messages")]
public class SharedMessageController(ChatsDB db) : ControllerBase
{
    //[HttpGet]
    //public async Task<ActionResult<SharedMessageDto>> GetSharedMessage(Guid chatId, CancellationToken cancellationToken)
    //{
    //    if (await db.Chats.AnyAsync(x => x.Id == chatId && x.IsShared && !x.IsDeleted, cancellationToken: cancellationToken))
    //    {
    //        return NotFound();
    //    }

    //    SharedMessageItemDto[] messages = await db.ChatMessages
    //        .Where(m => m.ChatId == chatId && m.Role != DBConversationRoles.System)
    //        .Select(x => new ChatMessageTemp()
    //        {
    //            Id = x.Id,
    //            ParentId = x.ParentId,
    //            Role = x.Role,
    //            Content = x.Messages,
    //            InputTokens = x.InputTokens,
    //            OutputTokens = x.OutputTokens,
    //            InputPrice = x.InputPrice,
    //            OutputPrice = x.OutputPrice,
    //            CreatedAt = x.CreatedAt,
    //            Duration = x.Duration,
    //            ModelId = x.ChatModelId,
    //            ModelName = x.ChatModel!.Name
    //        })
    //        .OrderBy(x => x.CreatedAt)
    //        .AsAsyncEnumerable()
    //        .Select(x => x.ToDto())
    //        .ToArrayAsync(cancellationToken);
    //}
}
