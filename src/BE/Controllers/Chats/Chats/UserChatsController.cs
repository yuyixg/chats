using Chats.BE.Controllers.Chats.Chats.Dtos;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.Chats;

[Route("api/user/chats"), Authorize]
public class UserChatsController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet("{chatId}")]
    public async Task<ActionResult<ChatsResponse>> GetOneChat(Guid chatId, CancellationToken cancellationToken)
    {
        ChatsResponseTemp? temp = await db.Chats
            .Where(x => x.Id == chatId && x.UserId == currentUser.Id && !x.IsDeleted)
            .Select(x => new ChatsResponseTemp()
            {
                Id = x.Id,
                Title = x.Title,
                ChatModelId = x.ChatModelId,
                ModelName = x.ChatModel!.Name,
                ModelConfig = x.ChatModel!.ModelConfig,
                IsShared = x.IsShared,
                UserModelConfig = x.UserModelConfig,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (temp == null)
        {
            return NotFound();
        }

        return Ok(temp.ToResponse());
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ChatsResponse>>> GetChats([FromQuery] PagingRequest request, CancellationToken cancellationToken)
    {
        IQueryable<Chat> query = db.Chats
            .Include(x => x.ChatModel)
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt);
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            query = query.Where(x => x.Title.Contains(request.Query));
        }

        PagedResult<ChatsResponse> result = await PagedResult.FromTempQuery(query
            .Select(x => new ChatsResponseTemp()
            {
                Id = x.Id,
                Title = x.Title,
                ChatModelId = x.ChatModelId,
                ModelName = x.ChatModel!.Name,
                ModelConfig = x.ChatModel!.ModelConfig,
                IsShared = x.IsShared,
                UserModelConfig = x.UserModelConfig,
            }),
            request,
            x => x.ToResponse(), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ChatsResponse>> CreateChats([FromBody] CreateChatsRequest request, CancellationToken cancellationToken)
    {
        Chat? lastChat = await db.Chats
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        Chat chat = new()
        {
            Id = Guid.NewGuid(),
            UserId = currentUser.Id,
            Title = request.Title,
            ChatModelId = lastChat?.ChatModelId,
            IsShared = false,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false,
            UserModelConfig = "{}",
        };
        db.Chats.Add(chat);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(ChatsResponse.FromDB(chat));
    }

    [HttpDelete("{chatId}")]
    public async Task<IActionResult> DeleteChats(Guid chatId, CancellationToken cancellationToken)
    {
        bool exists = await db.Chats
            .AnyAsync(x => x.Id == chatId && x.UserId == currentUser.Id, cancellationToken);
        if (!exists)
        {
            return NotFound();
        }

        if (await db.ChatMessages.AnyAsync(m => m.ChatId == chatId, cancellationToken))
        {
            await db.Chats
                .Where(x => x.Id == chatId)
                .ExecuteUpdateAsync(x => x.SetProperty(y => y.IsDeleted, true), cancellationToken);
        }
        else
        {
            await db.Chats
                .Where(x => x.Id == chatId)
                .ExecuteDeleteAsync(cancellationToken);
        }

        return NoContent();
    }

    [HttpPut("{chatId}")]
    public async Task<IActionResult> UpdateChats(Guid chatId, [FromBody] UpdateChatsRequest request, CancellationToken cancellationToken)
    {
        Chat? chat = await db.Chats
            .Where(x => x.Id == chatId && x.UserId == currentUser.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (chat == null)
        {
            return NotFound();
        }

        request.ApplyToChats(chat);
        if (db.ChangeTracker.HasChanges())
        {
            // TODO: should update UpdatedAt field
            // chat.CreatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
