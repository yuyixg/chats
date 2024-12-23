using Chats.BE.Controllers.Chats.UserChats.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
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
        ChatsResponse? result = await db.Chats
            .Where(x => x.Id == idEncryption.DecryptChatId(encryptedChatId) && x.UserId == currentUser.Id && !x.IsDeleted)
            .Select(x => new ChatsResponse()
            {
                Id = idEncryption.EncryptChatId(x.Id),
                Title = x.Title,
                IsShared = x.IsShared,
                Spans = x.ChatSpans.Select(s => new ChatSpanDto
                {
                    SpanId = s.SpanId,
                    ModelId = s.ModelId,
                    ModelName = s.Model.Name,
                    ModelProviderId = s.Model.ModelKey.ModelProviderId,
                    Temperature = s.Temperature,
                    EnableSearch = s.EnableSearch,
                }).ToArray(),
                MessageCount = x.Messages.Count,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ChatsResponse>>> GetChats([FromQuery] PagingRequest request, CancellationToken cancellationToken)
    {
        IQueryable<Chat> query = db.Chats
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .OrderByDescending(x => x.Id);
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            query = query.Where(x => x.Title.Contains(request.Query));
        }

        PagedResult<ChatsResponse> result = await PagedResult.FromQuery(query
            .Select(x => new ChatsResponse()
            {
                Id = idEncryption.EncryptChatId(x.Id),
                Title = x.Title,
                IsShared = x.IsShared,
                Spans = x.ChatSpans.Select(s => new ChatSpanDto
                {
                    SpanId = s.SpanId,
                    ModelId = s.ModelId,
                    ModelName = s.Model.Name,
                    ModelProviderId = s.Model.ModelKey.ModelProviderId,
                    Temperature = s.Temperature,
                    EnableSearch = s.EnableSearch,
                }).ToArray(),
                MessageCount = x.Messages.Count,
            }),
            request,
            cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ChatsResponse>> CreateChat([FromBody] CreateChatRequest request, [FromServices] UserModelManager userModelManager, CancellationToken cancellationToken)
    {
        Dictionary<short, UserModel> validModels = await userModelManager.GetValidModelsByUserId(currentUser.Id)
            .ToDictionaryAsync(k => k.ModelId, v => v, cancellationToken);
        if (validModels.Count == 0)
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
        };

        Chat? lastChat = await db.Chats
            .Include(x => x.ChatSpans)
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted && x.ChatSpans.Any())
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (lastChat != null && lastChat.ChatSpans.All(cs => validModels.ContainsKey(cs.ModelId)))
        {
            chat.ChatSpans = lastChat.ChatSpans.Select(cs => new ChatSpan()
            {
                ModelId = cs.ModelId,
                EnableSearch = cs.EnableSearch,
                Temperature = cs.Temperature,
            }).ToList();
        }
        else
        {
            chat.ChatSpans =
            [
                new ChatSpan()
                {
                    ModelId = validModels.Values.First().ModelId,
                    EnableSearch = false,
                    Temperature = ChatService.DefaultTemperature,
                }
            ];
        }
        db.Chats.Add(chat);
        await db.SaveChangesAsync(cancellationToken);

        // fill model because it's needed next
        foreach (ChatSpan span in chat.ChatSpans)
        {
            span.Model = validModels[span.ModelId].Model;
        }
        return Created(default(string), new ChatsResponse()
        {
            Id = idEncryption.EncryptChatId(chat.Id),
            Title = chat.Title,
            IsShared = chat.IsShared,
            Spans = chat.ChatSpans.Select(s => new ChatSpanDto
            {
                SpanId = s.SpanId,
                ModelId = s.ModelId,
                ModelName = s.Model.Name,
                ModelProviderId = s.Model.ModelKey.ModelProviderId,
                Temperature = s.Temperature,
                EnableSearch = s.EnableSearch,
            }).ToArray(),
            MessageCount = chat.Messages.Count,
        });
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
        if (request.ModelId != null)
        {
            return BadRequest("ModelId is not allowed to be updated anymore, please use ChatSpan update API.");
        }

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
