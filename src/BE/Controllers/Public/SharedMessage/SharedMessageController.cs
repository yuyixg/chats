using Chats.BE.Controllers.Admin.AdminMessage;
using Chats.BE.Controllers.Admin.AdminMessage.Dtos;
using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.PublicMessage;

[Route("api/public/messages")]
public class SharedMessageController(ChatsDB db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdminMessageDto>> GetSharedMessage(Guid chatId, CancellationToken cancellationToken)
    {
        if (!await db.Chats.AnyAsync(x => x.Id == chatId && x.IsShared && !x.IsDeleted, cancellationToken: cancellationToken))
        {
            return NotFound();
        }

        return await AdminMessageController.GetAdminMessageInternal(db, chatId, cancellationToken);
    }
}
