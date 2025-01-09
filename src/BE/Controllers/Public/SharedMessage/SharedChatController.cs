using Chats.BE.Controllers.Admin.AdminMessage;
using Chats.BE.Controllers.Admin.AdminMessage.Dtos;
using Chats.BE.Controllers.Chats.UserChats.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Infrastructure.Functional;
using Chats.BE.Services;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.SharedMessage;

[Route("api/public/chats")]
public class SharedChatController(ChatsDB db) : ControllerBase
{
    [HttpGet("{path}")]
    public async Task<ActionResult<ChatsResponseWithMessage>> GetSharedChat(string path,
        long validBefore, string hash,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        Result<int> decodedChat = idEncryption.DecodeChatIdPath(path, validBefore, hash);
        if (decodedChat.IsFailure)
        {
            return BadRequest(decodedChat.Error);
        }

        if (!await db.Chats.AnyAsync(x => x.Id == decodedChat.Value && !x.IsArchived, cancellationToken))
        {
            return NotFound();
        }

        return Ok(await AdminMessageController.InternalGetChatWithMessages(db, idEncryption, decodedChat.Value, fup, cancellationToken));
    }

    [HttpPost("{encryptedChatId}"), Authorize]
    public async Task<ActionResult<string>> CreateShared(string encryptedChatId,
        DateTimeOffset validBefore,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] CurrentUser user,
        [FromServices] HostUrlService hostUrlservice,
        CancellationToken cancellationToken)
    {
        int chatId = idEncryption.DecryptChatId(encryptedChatId);
        Chat? chat = await db.Chats.FirstOrDefaultAsync(x => x.Id == chatId && x.UserId == user.Id && !x.IsArchived, cancellationToken: cancellationToken);
        if (chat == null)
        {
            return NotFound();
        }

        string path = idEncryption.CreateChatIdPath(new TimedId(chatId, validBefore));
        return Created(new Uri($"{hostUrlservice.GetFEUrl()}/share/{path}"), null);
    }
}
