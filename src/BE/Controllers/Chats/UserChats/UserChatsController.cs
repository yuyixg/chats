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
            .Where(x => x.Id == idEncryption.DecryptChatId(encryptedChatId) && x.UserId == currentUser.Id && !x.IsArchived)
            .Select(x => new ChatsResponse()
            {
                Id = idEncryption.EncryptChatId(x.Id),
                Title = x.Title,
                Spans = x.ChatSpans.Select(s => new ChatSpanDto
                {
                    SpanId = s.SpanId,
                    ModelId = s.ModelId,
                    ModelName = s.Model.Name,
                    ModelProviderId = s.Model.ModelKey.ModelProviderId,
                    Temperature = s.Temperature,
                    EnableSearch = s.EnableSearch,
                }).ToArray(),
                LeafMessageId = x.LeafMessageId != null ? idEncryption.EncryptMessageId(x.LeafMessageId.Value) : null,
                UpdatedAt = x.UpdatedAt,
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
            .Where(x => x.UserId == currentUser.Id && !x.IsArchived)
            .OrderByDescending(x => x.UpdatedAt);
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            query = query.Where(x => x.Title.Contains(request.Query));
        }

        PagedResult<ChatsResponse> result = await PagedResult.FromQuery(query
            .Select(x => new ChatsResponse()
            {
                Id = idEncryption.EncryptChatId(x.Id),
                Title = x.Title,
                Spans = x.ChatSpans.Select(s => new ChatSpanDto
                {
                    SpanId = s.SpanId,
                    ModelId = s.ModelId,
                    ModelName = s.Model.Name,
                    ModelProviderId = s.Model.ModelKey.ModelProviderId,
                    Temperature = s.Temperature,
                    EnableSearch = s.EnableSearch,
                }).ToArray(),
                LeafMessageId = x.LeafMessageId != null ? idEncryption.EncryptMessageId(x.LeafMessageId.Value) : null,
                UpdatedAt = x.UpdatedAt,
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
            CreatedAt = DateTime.UtcNow,
            IsArchived = false,
            UpdatedAt = DateTime.UtcNow,
        };

        Chat? lastChat = await db.Chats
            .Include(x => x.ChatSpans.OrderBy(x => x.SpanId))
            .Where(x => x.UserId == currentUser.Id && !x.IsArchived && x.ChatSpans.Any())
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (lastChat != null && lastChat.ChatSpans.All(cs => validModels.ContainsKey(cs.ModelId)))
        {
            chat.ChatSpans = lastChat.ChatSpans.Select((cs, i) => new ChatSpan()
            {
                ModelId = cs.ModelId,
                Model = validModels[cs.ModelId].Model,
                EnableSearch = cs.EnableSearch,
                Temperature = cs.Temperature,
                SpanId = (byte)i,
            }).ToList();
        }
        else
        {
            chat.ChatSpans =
            [
                new ChatSpan()
                {
                    ModelId = validModels.Values.First().ModelId,
                    Model = validModels.Values.First().Model,
                    EnableSearch = false,
                    Temperature = ChatService.DefaultTemperature,
                }
            ];
        }
        db.Chats.Add(chat);
        await db.SaveChangesAsync(cancellationToken);

        return Created(default(string), new ChatsResponse()
        {
            Id = idEncryption.EncryptChatId(chat.Id),
            Title = chat.Title,
            Spans = chat.ChatSpans.Select(s => new ChatSpanDto
            {
                SpanId = s.SpanId,
                ModelId = s.ModelId,
                ModelName = s.Model.Name,
                ModelProviderId = s.Model.ModelKey.ModelProviderId,
                Temperature = s.Temperature,
                EnableSearch = s.EnableSearch,
            }).ToArray(),
            LeafMessageId = chat.LeafMessageId != null ? idEncryption.EncryptMessageId(chat.LeafMessageId.Value) : null,
            UpdatedAt = chat.UpdatedAt,
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

        await db.Chats
            .Where(x => x.Id == chatId)
            .ExecuteDeleteAsync(cancellationToken);

        return NoContent();
    }

    [HttpGet("archived")]
    public async Task<ActionResult<ChatsResponse>> ListArchived(CancellationToken cancellationToken)
    {
        List<ChatsResponse> result = await db.Chats
            .Where(x => x.UserId == currentUser.Id && x.IsArchived)
            .Select(x => new ChatsResponse()
            {
                Id = idEncryption.EncryptChatId(x.Id),
                Title = x.Title,
                Spans = x.ChatSpans.Select(s => new ChatSpanDto
                {
                    SpanId = s.SpanId,
                    ModelId = s.ModelId,
                    ModelName = s.Model.Name,
                    ModelProviderId = s.Model.ModelKey.ModelProviderId,
                    Temperature = s.Temperature,
                    EnableSearch = s.EnableSearch,
                }).ToArray(),
                LeafMessageId = x.LeafMessageId != null ? idEncryption.EncryptMessageId(x.LeafMessageId.Value) : null,
                UpdatedAt = x.UpdatedAt,
            })
            .ToListAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPut("{encryptedChatId}")]
    public async Task<IActionResult> UpdateChats(string encryptedChatId, [FromBody] UpdateChatsRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        DecryptedUpdateChatsRequest req = request.Decrypt(idEncryption);

        Chat? chat = await db.Chats
            .Where(x => x.Id == idEncryption.DecryptChatId(encryptedChatId) && x.UserId == currentUser.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (chat == null)
        {
            return NotFound();
        }

        string? error = await req.Validate(db, chat.Id);
        if (error != null)
        {
            return BadRequest(error);
        }

        req.ApplyToChats(chat);
        if (db.ChangeTracker.HasChanges())
        {
            chat.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }
        return NoContent();
    }
}
