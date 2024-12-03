using Chats.BE.Controllers.Admin.AdminMessage;
using Chats.BE.Controllers.Admin.AdminMessage.Dtos;
using Chats.BE.DB;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.SharedMessage;

[Route("api/public/messages")]
public class SharedMessageController(ChatsDB db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdminMessageRoot>> GetSharedMessage(string chatId,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        int conversationId = idEncryption.DecryptChatId(chatId);
        if (!await db.Chats.AnyAsync(x => x.Id == conversationId && x.IsShared && !x.IsDeleted, cancellationToken: cancellationToken))
        {
            return NotFound();
        }

        return await AdminMessageController.GetAdminMessageInternal(db, conversationId, idEncryption, fup, cancellationToken);
    }
}
