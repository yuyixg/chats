using Chats.BE.Controllers.Admin.AdminMessage.Dtos;
using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.AdminMessage;

[Route("api/admin"), AuthorizeAdmin]
public class AdminMessageController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet("messages")]
    public async Task<ActionResult<PagedResult<AdminChatsDto>>> GetMessages([FromQuery] PagingRequest req, CancellationToken cancellationToken)
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

    [HttpGet("message-details")]
    public async Task<ActionResult<AdminMessageDto>> GetAdminMessage(Guid chatId, CancellationToken cancellationToken)
    {
        return await GetAdminMessageInternal(db, chatId, cancellationToken);
    }

    internal static async Task<ActionResult<AdminMessageDto>> GetAdminMessageInternal(ChatsDB db, Guid chatId, CancellationToken cancellationToken)
    {
        AdminMessageDtoTemp? adminMessageTemp = await db.Chats
                    .Where(x => x.Id == chatId)
                    .Select(x => new AdminMessageDtoTemp()
                    {
                        Name = x.Title,
                        ModelName = x.ChatModel!.Name,
                        UserModelConfigText = x.UserModelConfig,
                        ModelConfigText = x.ChatModel.ModelConfig,
                    })
                    .SingleOrDefaultAsync(cancellationToken);
        if (adminMessageTemp == null) return new NotFoundResult();

        AdminMessageItemTemp[] messagesTemp = await db.ChatMessages
            .Where(x => x.ChatId == chatId)
            .Select(x => new AdminMessageItemTemp
            {
                Id = x.Id,
                ParentId = x.ParentId,
                ModelName = x.ChatModel!.Name,
                CreatedAt = x.CreatedAt,
                InputTokens = x.InputTokens,
                OutputTokens = x.OutputTokens,
                InputPrice = x.InputPrice,
                OutputPrice = x.OutputPrice,
                Role = x.Role,
                ContentText = x.Messages,
                Duration = x.Duration,
            })
            .OrderBy(x => x.CreatedAt)
            .ToArrayAsync(cancellationToken);

        AdminMessageBasicItem[] items = AdminMessageItemTemp.ToDtos(messagesTemp);
        AdminMessageDto dto = adminMessageTemp.ToDto(items);

        return new OkObjectResult(dto);
    }
}
