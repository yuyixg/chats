using Chats.BE.Controllers.Admin.AdminMessage.Dtos;
using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.AdminMessage;

[Route("api/admin"), AuthorizeAdmin]
public class AdminMessageController(ChatsDB db, CurrentUser currentUser, IUrlEncryptionService idEncryption) : ControllerBase
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
                ModelName = x.Model.Name,
                Title = x.Title,
                UserName = x.User.Username,
                //Cost = x.Messages.Select(x => x.Usage).Sum(x => x.InputCost + x.OutputCost)
                JsonUserModelConfig = new JsonUserModelConfig()
                {
                    Temperature = x.Temperature, 
                    EnableSearch = x.EnableSearch,
                },
            }), req, x => x.ToDto(), cancellationToken);
    }

    [HttpGet("message-details")]
    public async Task<ActionResult<AdminMessageRoot>> GetAdminMessage(int chatId,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        return await GetAdminMessageInternal(db, chatId, idEncryption, fup, cancellationToken);
    }

    internal static async Task<ActionResult<AdminMessageRoot>> GetAdminMessageInternal(ChatsDB db, int conversationId, 
        IUrlEncryptionService urlEncryption, 
        FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        AdminMessageDtoTemp? adminMessageTemp = await db.Chats
                    .Where(x => x.Id == conversationId)
                    .Select(x => new AdminMessageDtoTemp()
                    {
                        Name = x.Title,
                        ModelName = x.Model.Name,
                        Temperature = x.Temperature,
                        DeploymentName = x.Model.DeploymentName,
                    })
                    .SingleOrDefaultAsync(cancellationToken);
        if (adminMessageTemp == null) return new NotFoundResult();

        AdminMessageItemTemp[] messagesTemp = await db.Messages
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentBlob)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentFile).ThenInclude(x => x!.File).ThenInclude(x => x.FileService)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentText)
            .Where(x => x.ChatId == conversationId)
            .Select(x => new AdminMessageItemTemp
            {
                Id = x.Id,
                ParentId = x.ParentId,
                ModelName = x.Usage!.UserModel.Model.Name,
                CreatedAt = x.CreatedAt,
                InputTokens = x.Usage.InputTokens,
                OutputTokens = x.Usage.OutputTokens,
                InputPrice = x.Usage.InputCost,
                OutputPrice = x.Usage.OutputCost,
                ReasoningTokens = x.Usage.ReasoningTokens,
                Role = (DBChatRole)x.ChatRoleId,
                Content = x.MessageContents
                    .ToArray(),
                Duration = x.Usage.TotalDurationMs - x.Usage.PreprocessDurationMs,
                FirstTokenLatency = x.Usage.FirstResponseDurationMs
            })
            .OrderBy(x => x.Id)
            .ToArrayAsync(cancellationToken);

        AdminMessageBasicItem[] items = AdminMessageItemTemp.ToDtos(messagesTemp, urlEncryption, fup);
        AdminMessageRoot dto = adminMessageTemp.ToDto(items);

        return new OkObjectResult(dto);
    }
}
