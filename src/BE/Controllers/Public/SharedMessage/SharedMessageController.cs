using Chats.BE.Controllers.Admin.AdminMessage;
using Chats.BE.Controllers.Admin.AdminMessage.Dtos;
using Chats.BE.DB;
using Chats.BE.Services.IdEncryption;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.SharedMessage;

[Route("api/public/messages")]
public class SharedMessageController(ChatsDB db, IIdEncryptionService idEncryption) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdminMessageRoot>> GetSharedMessage(string chatId, CancellationToken cancellationToken)
    {
        int conversationId = idEncryption.DecryptAsInt32(chatId);
        if (!await db.Chats.AnyAsync(x => x.Id == conversationId && x.IsShared && !x.IsDeleted, cancellationToken: cancellationToken))
        {
            return NotFound();
        }

        return await AdminMessageController.GetAdminMessageInternal(db, conversationId, idEncryption, cancellationToken);
    }
}
