using Chats.BE.Controllers.Admin.AdminMessage.Dtos;
using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.Controllers.Chats.UserChats.Dtos;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Models;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.AdminMessage;

[Route("api/admin"), AuthorizeAdmin]
public class AdminMessageController(ChatsDB db, CurrentUser currentUser, IUrlEncryptionService urlEncryption) : ControllerBase
{
    [HttpGet("chats")]
    public async Task<ActionResult<PagedResult<AdminChatsDto>>> GetAdminChats([FromQuery] PagingRequest req, CancellationToken cancellationToken)
    {
        IQueryable<Chat> chats = db.Chats
            .Where(x => x.User.Role != "admin" || x.UserId == currentUser.Id);
        if (!string.IsNullOrEmpty(req.Query))
        {
            chats = chats.Where(x => x.User.UserName == req.Query);
        }

        return await PagedResult.FromQuery(chats
            .OrderByDescending(x => x.Id)
            .Select(x => new AdminChatsDto
            {
                Id = x.Id.ToString(),
                CreatedAt = x.CreatedAt,
                IsDeleted = x.IsArchived,
                IsShared = x.ChatShares.Any(),
                Title = x.Title,
                UserName = x.User.UserName,
                Spans = x.ChatSpans.Select(s => new ChatSpanDto
                {
                    SpanId = s.SpanId,
                    ModelId = s.ModelId,
                    ModelName = s.Model.Name,
                    ModelProviderId = s.Model.ModelKey.ModelProviderId,
                    Temperature = s.Temperature,
                    EnableSearch = s.EnableSearch,
                }).ToArray(),
            }), req, cancellationToken);
    }

    [HttpGet("message-details")]
    public async Task<ActionResult<ChatsResponseWithMessage>> GetAdminMessage(int chatId,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        ChatsResponseWithMessage? resp = await InternalGetChatWithMessages(db, urlEncryption, chatId, fup, cancellationToken);
        return Ok(resp);
    }

    internal static async Task<ChatsResponseWithMessage?> InternalGetChatWithMessages(ChatsDB db, IUrlEncryptionService urlEncryption, int chatId, FileUrlProvider fup, CancellationToken cancellationToken)
    {
        ChatsResponse? chats = await db.Chats
            .Where(x => x.Id == chatId)
            .Select(x => new ChatsResponse()
            {
                Id = urlEncryption.EncryptChatId(x.Id),
                Title = x.Title,
                IsShared = x.ChatShares.Any(),
                IsTopMost = x.IsTopMost,
                GroupId = urlEncryption.EncryptChatGroupId(x.ChatGroupId),
                Tags = x.ChatTags.Select(x => x.Name).ToArray(),
                Spans = x.ChatSpans.Select(s => new ChatSpanDto
                {
                    SpanId = s.SpanId,
                    ModelId = s.ModelId,
                    ModelName = s.Model.Name,
                    ModelProviderId = s.Model.ModelKey.ModelProviderId,
                    Temperature = s.Temperature,
                    EnableSearch = s.EnableSearch,
                }).ToArray(),
                LeafMessageId = x.LeafMessageId != null ? urlEncryption.EncryptMessageId(x.LeafMessageId.Value) : null,
                UpdatedAt = x.UpdatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (chats == null) return null;

        return chats.WithMessages(await db.Messages
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentBlob)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentFile).ThenInclude(x => x!.File).ThenInclude(x => x.FileService)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentText)
            .Where(m => m.ChatId == chatId && m.ChatRoleId != (byte)DBChatRole.System)
            .Select(x => new ChatMessageTemp()
            {
                Id = x.Id,
                ParentId = x.ParentId,
                Role = (DBChatRole)x.ChatRoleId,
                Content = x.MessageContents
                    .OrderBy(x => x.Id)
                    .ToArray(),
                CreatedAt = x.CreatedAt,
                SpanId = x.SpanId,
                Usage = x.Usage == null ? null : new ChatMessageTempUsage()
                {
                    InputTokens = x.Usage.InputTokens,
                    OutputTokens = x.Usage.OutputTokens,
                    InputPrice = x.Usage.InputCost,
                    OutputPrice = x.Usage.OutputCost,
                    ReasoningTokens = x.Usage.ReasoningTokens,
                    Duration = x.Usage.TotalDurationMs - x.Usage.PreprocessDurationMs,
                    FirstTokenLatency = x.Usage.FirstResponseDurationMs,
                    ModelId = x.Usage.UserModel.ModelId,
                    ModelName = x.Usage.UserModel.Model.Name,
                    ModelProviderId = x.Usage.UserModel.Model.ModelKey.ModelProviderId,
                    Reaction = x.ReactionId,
                },
            })
            .OrderBy(x => x.CreatedAt)
            .Select(x => x.ToDto(urlEncryption, fup))
            .ToArrayAsync(cancellationToken));
    }
}
