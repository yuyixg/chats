using Chats.BE.Controllers.Admin.AdminMessage.Dtos;
using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Admin.AdminMessage;

[Route("api/admin"), AuthorizeAdmin]
public class AdminMessageController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet("messages")]
    public async Task<ActionResult<PagedResult<AdminChatsDto>>> SendMessage([FromQuery] PagingRequest req, CancellationToken cancellationToken)
    {
        IQueryable<Chat> chats = db.Chats
            .Where(x => x.User.Role != "admin" || x.UserId == currentUser.Id);
        if (!string.IsNullOrEmpty(req.Query))
        {
            chats = chats.Where(x => x.User.Username == req.Query);
        }

        return await PagedResult.FromTempQuery(chats
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new AdminChatsDtoTemp
            {
                Id = x.Id,
                CreatedAt = x.CreatedAt,
                IsDeleted = x.IsDeleted,
                IsShared = x.IsShared,
                ModelName = x.ChatModel!.Name,
                Title = x.Title,
                UserName = x.User.Username,
                JsonUserModelConfig = x.UserModelConfig,
            }), req, x => x.ToDto(), cancellationToken);
    }
}
