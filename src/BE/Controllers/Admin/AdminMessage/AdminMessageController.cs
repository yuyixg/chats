using Chats.BE.Controllers.Admin.AdminMessage.Dtos;
using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.IdEncryption;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.AdminMessage;

[Route("api/admin"), AuthorizeAdmin]
public class AdminMessageController(ChatsDB db, CurrentUser currentUser, IIdEncryptionService idEncryption) : ControllerBase
{
    [HttpGet("messages")]
    public async Task<ActionResult<PagedResult<AdminChatsDto>>> GetMessages([FromQuery] PagingRequest req, CancellationToken cancellationToken)
    {
        IQueryable<Conversation2> chats = db.Conversation2s
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
                JsonUserModelConfig = new JsonUserModelConfig()
                {
                    Temperature = x.Temperature, 
                    EnableSearch = x.EnableSearch,
                },
            }), req, x => x.ToDto(), cancellationToken);
    }

    [HttpGet("message-details")]
    public async Task<ActionResult<AdminMessageRoot>> GetAdminMessage(int chatId, CancellationToken cancellationToken)
    {
        return await GetAdminMessageInternal(db, chatId, idEncryption, cancellationToken);
    }

    internal static async Task<ActionResult<AdminMessageRoot>> GetAdminMessageInternal(ChatsDB db, int conversationId, IIdEncryptionService idEncryption, CancellationToken cancellationToken)
    {
        AdminMessageDtoTemp? adminMessageTemp = await db.Conversation2s
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

        AdminMessageItemTemp[] messagesTemp = await db.Message2s
            .Where(x => x.ConversationId == conversationId)
            .Select(x => new AdminMessageItemTemp
            {
                Id = x.Id,
                ParentId = x.ParentId,
                ModelName = x.Usage!.UserModel.Model.Name,
                CreatedAt = x.CreatedAt,
                InputTokens = x.Usage.InputTokenCount,
                OutputTokens = x.Usage.OutputTokenCount,
                InputPrice = x.Usage.InputCost,
                OutputPrice = x.Usage.OutputCost,
                Role = (DBConversationRole)x.ChatRoleId,
                Content = x.MessageContent2s
                    .Select(x => new DBMessageSegment 
                    { 
                        Content = x.Content, 
                        ContentType = (DBMessageContentType)x.ContentTypeId
                    })
                    .ToArray(),
                Duration = x.Usage.DurationMs,
            })
            .OrderBy(x => x.Id)
            .ToArrayAsync(cancellationToken);

        AdminMessageBasicItem[] items = AdminMessageItemTemp.ToDtos(messagesTemp, idEncryption);
        AdminMessageRoot dto = adminMessageTemp.ToDto(items);

        return new OkObjectResult(dto);
    }
}
