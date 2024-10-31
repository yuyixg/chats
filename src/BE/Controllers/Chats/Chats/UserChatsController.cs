using Chats.BE.Controllers.Chats.Chats.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.IdEncryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.Chats;

[Route("api/user/chats"), Authorize]
public class UserChatsController(ChatsDB db, CurrentUser currentUser, IIdEncryptionService idEncryption) : ControllerBase
{
    [HttpGet("{chatId}")]
    public async Task<ActionResult<ChatsResponse>> GetOneChat(string chatId, CancellationToken cancellationToken)
    {
        ChatsResponseTemp? temp = await db.Conversation2s
            .Where(x => x.Id == idEncryption.DecryptAsInt32(chatId) && x.UserId == currentUser.Id && !x.IsDeleted)
            .Select(x => new ChatsResponseTemp()
            {
                Id = x.Id,
                Title = x.Title,
                ChatModelId = x.ModelId,
                ModelName = x.Model.Name,
                EnableSearch = x.EnableSearch,
                Temperature = x.Temperature,
                IsShared = x.IsShared,
                UserModelConfig = new JsonUserModelConfig
                {
                    Temperature = x.Temperature, 
                    EnableSearch = x.EnableSearch, 
                },
                ModelProvider = (DBModelProvider)x.Model.ModelKey.ModelProviderId,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (temp == null)
        {
            return NotFound();
        }

        return Ok(temp.ToResponse(idEncryption));
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ChatsResponse>>> GetChats([FromQuery] PagingRequest request, CancellationToken cancellationToken)
    {
        IQueryable<Conversation2> query = db.Conversation2s
            .Include(x => x.Model)
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
                ChatModelId = x.ModelId,
                ModelName = x.Model!.Name,
                EnableSearch = x.EnableSearch,
                Temperature = ConversationService.DefaultTemperature,
                IsShared = x.IsShared,
                ModelProvider = (DBModelProvider)x.Model.ModelKey.ModelProviderId,
                UserModelConfig = new JsonUserModelConfig
                {
                    EnableSearch = x.EnableSearch, 
                    Temperature = x.Temperature,
                },
            }),
            request,
            x => x.ToResponse(idEncryption), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ChatsResponse>> CreateChats([FromBody] CreateChatsRequest request, [FromServices] UserModelManager userModelManager, CancellationToken cancellationToken)
    {
        UserModel2[] validModels = await userModelManager.GetValidModelsByUserId(currentUser.Id, cancellationToken);
        if (validModels.Length == 0)
        {
            return this.BadRequestMessage("No model available.");
        }

        Conversation2 chat = new()
        {
            UserId = currentUser.Id,
            Title = request.Title,
            IsShared = false,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false,
            Temperature = null, 
            EnableSearch = null, 
        };

        Conversation2? lastChat = await db.Conversation2s
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (lastChat?.ModelId != null && validModels.Any(m => m.ModelId == lastChat.ModelId))
        {
            chat.ModelId = lastChat.ModelId;
        }
        else
        {
            chat.ModelId = (validModels.FirstOrDefault(x => !x.IsExpired) ?? validModels.First()).ModelId;
        }
        db.Conversation2s.Add(chat);
        await db.SaveChangesAsync(cancellationToken);

        // load ChatModel Provider here
        chat.Model = await db.Models
            .Where(x => x.Id == chat.ModelId)
            .SingleAsync(cancellationToken);
        return Ok(ChatsResponse.FromDB(chat, idEncryption));
    }

    [HttpDelete("{chatId}")]
    public async Task<IActionResult> DeleteChats(string chatId, CancellationToken cancellationToken)
    {
        bool exists = await db.Conversation2s
            .AnyAsync(x => x.Id == idEncryption.DecryptAsInt32(chatId) && x.UserId == currentUser.Id, cancellationToken);
        if (!exists)
        {
            return NotFound();
        }

        if (await db.Message2s.AnyAsync(m => m.ConversationId == idEncryption.DecryptAsInt32(chatId), cancellationToken))
        {
            await db.Conversation2s
                .Where(x => x.Id == idEncryption.DecryptAsInt32(chatId))
                .ExecuteUpdateAsync(x => x.SetProperty(y => y.IsDeleted, true), cancellationToken);
        }
        else
        {
            await db.Conversation2s
                .Where(x => x.Id == idEncryption.DecryptAsInt32(chatId))
                .ExecuteDeleteAsync(cancellationToken);
        }

        return NoContent();
    }

    [HttpPut("{chatId}")]
    public async Task<IActionResult> UpdateChats(string chatId, [FromBody] UpdateChatsRequest request, CancellationToken cancellationToken)
    {
        Conversation2? chat = await db.Conversation2s
            .Where(x => x.Id == idEncryption.DecryptAsInt32(chatId) && x.UserId == currentUser.Id)
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
