using Chats.BE.Controllers.Chats.UserChats.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Common;
using Chats.BE.Services.ChatServices;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.UserChats;

[Route("api/user/chats"), Authorize]
public class UserChatsController(ChatsDB db, CurrentUser currentUser, IUrlEncryptionService idEncryption) : ControllerBase
{
    [HttpGet("{encryptedChatId}")]
    public async Task<ActionResult<ChatsResponse>> GetOneChat(string encryptedChatId, CancellationToken cancellationToken)
    {
        ChatsResponseTemp? temp = await db.Chats
            .Where(x => x.Id == idEncryption.DecryptChatId(encryptedChatId) && x.UserId == currentUser.Id && !x.IsDeleted)
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
        IQueryable<Chat> query = db.Chats
            .Include(x => x.Model)
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .OrderByDescending(x => x.Id);
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
                Temperature = ChatService.DefaultTemperature,
                IsShared = x.IsShared,
                ModelProvider = (DBModelProvider)x.Model.ModelKey.ModelProviderId,
                UserModelConfig = new JsonUserModelConfig
                {
                    EnableSearch = x.EnableSearch, 
                    Temperature = x.Temperature,
                    Prompt = x.Messages
                        .FirstOrDefault(x => x.ChatRoleId == (byte)DBChatRole.System)
                        !.MessageContents
                        .FirstOrDefault()
                        !.MessageContentText
                        !.Content
                },
            }),
            request,
            x => x.ToResponse(idEncryption), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ChatsResponse>> CreateChats([FromBody] CreateChatsRequest request, [FromServices] UserModelManager userModelManager, CancellationToken cancellationToken)
    {
        UserModel[] validModels = await userModelManager.GetValidModelsByUserId(currentUser.Id, cancellationToken);
        if (validModels.Length == 0)
        {
            return this.BadRequestMessage("No model available.");
        }

        Chat chat = new()
        {
            UserId = currentUser.Id,
            Title = request.Title,
            IsShared = false,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false,
            Temperature = null, 
            EnableSearch = null, 
        };

        Chat? lastChat = await db.Chats
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (lastChat?.ModelId != null && validModels.Any(m => m.ModelId == lastChat.ModelId))
        {
            chat.ModelId = lastChat.ModelId;
        }
        else
        {
            chat.ModelId = (validModels.FirstOrDefault(x => !x.ExpiresAt.IsExpired()) ?? validModels.First()).ModelId;
        }
        db.Chats.Add(chat);
        await db.SaveChangesAsync(cancellationToken);

        // load ChatModel Provider here
        chat.Model = await db.Models
            .Where(x => x.Id == chat.ModelId)
            .SingleAsync(cancellationToken);
        return Ok(ChatsResponse.FromDB(chat, idEncryption));
    }

    [HttpDelete("{encryptedChatId}")]
    public async Task<IActionResult> DeleteChats(string encryptedChatId, CancellationToken cancellationToken)
    {
        int chatId = idEncryption.DecryptChatId(encryptedChatId);
        bool exists = await db.Chats
            .AnyAsync(x => x.Id == chatId && x.UserId == currentUser.Id, cancellationToken);
        if (!exists)
        {
            return NotFound();
        }

        if (await db.Messages.AnyAsync(m => m.ChatId == chatId, cancellationToken))
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

    [HttpPut("{encryptedChatId}")]
    public async Task<IActionResult> UpdateChats(string encryptedChatId, [FromBody] UpdateChatsRequest request, CancellationToken cancellationToken)
    {
        Chat? chat = await db.Chats
            .Where(x => x.Id == idEncryption.DecryptChatId(encryptedChatId) && x.UserId == currentUser.Id)
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
