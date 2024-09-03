using Chats.BE.Controllers.Chats.Chats.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Chats.BE.Controllers.Chats.Chats;

[Route("api/user/chats"), Authorize]
public class UserChatsController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet("{chatId}")]
    public async Task<ActionResult<ChatsResponse>> GetOneChat(int chatId, CancellationToken cancellationToken)
    {
        ChatsResponseTemp? temp = await db.Conversations
            .Where(x => x.Id == chatId && x.UserId == currentUser.Id && !x.IsDeleted)
            .Select(x => new ChatsResponseTemp()
            {
                Id = x.Id,
                Title = x.Title,
                ChatModelId = x.ChatModelId,
                ModelName = x.ChatModel!.Name,
                ModelConfig = x.ChatModel!.ModelConfig,
                IsShared = x.IsShared,
                UserModelConfig = new JsonUserModelConfig
                {
                    Temperature = x.Temperature, 
                    EnableSearch = x.EnableSearch, 
                },
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
        IQueryable<Conversation> query = db.Conversations
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
                UserModelConfig = new JsonUserModelConfig
                {
                    EnableSearch = x.EnableSearch, 
                    Temperature = x.Temperature,
                },
            }),
            request,
            x => x.ToResponse(), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ChatsResponse>> CreateChats([FromBody] CreateChatsRequest request, CancellationToken cancellationToken)
    {
        string? jsonModel = await db.UserModels
                .Where(x => x.UserId == currentUser.Id)
                .Select(x => x.Models)
                .FirstOrDefaultAsync();
        if (jsonModel == null) return this.BadRequestMessage("No model available(no data).");
        HashSet<Guid> userModels = JsonSerializer.Deserialize<JsonTokenBalance[]>(jsonModel)!
            .Where(x => x.Enabled)
            .Select(x => x.ModelId)
            .ToHashSet();
        if (userModels.Count == 0)
        {
            return this.BadRequestMessage("No model available.");
        }

        Conversation chat = new()
        {
            UserId = currentUser.Id,
            Title = request.Title,
            IsShared = false,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false,
            Temperature = null, 
            EnableSearch = null, 
        };

        Conversation? lastChat = await db.Conversations
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (lastChat?.ChatModelId != null && userModels.Contains(lastChat.ChatModelId))
        {
            chat.ChatModelId = lastChat.ChatModelId;
        }
        else
        {
            chat.ChatModelId = userModels.First();
        }
        db.Conversations.Add(chat);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(ChatsResponse.FromDB(chat));
    }

    [HttpDelete("{chatId}")]
    public async Task<IActionResult> DeleteChats(int chatId, CancellationToken cancellationToken)
    {
        bool exists = await db.Conversations
            .AnyAsync(x => x.Id == chatId && x.UserId == currentUser.Id, cancellationToken);
        if (!exists)
        {
            return NotFound();
        }

        if (await db.Messages.AnyAsync(m => m.ConversationId == chatId, cancellationToken))
        {
            await db.Conversations
                .Where(x => x.Id == chatId)
                .ExecuteUpdateAsync(x => x.SetProperty(y => y.IsDeleted, true), cancellationToken);
        }
        else
        {
            await db.Conversations
                .Where(x => x.Id == chatId)
                .ExecuteDeleteAsync(cancellationToken);
        }

        return NoContent();
    }

    [HttpPut("{chatId}")]
    public async Task<IActionResult> UpdateChats(int chatId, [FromBody] UpdateChatsRequest request, CancellationToken cancellationToken)
    {
        Conversation? chat = await db.Conversations
            .Where(x => x.Id == chatId && x.UserId == currentUser.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (chat == null)
        {
            return NotFound();
        }

        request.ApplyToChats(chat);
        if (db.ChangeTracker.HasChanges())
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        return NoContent();
    }
}
