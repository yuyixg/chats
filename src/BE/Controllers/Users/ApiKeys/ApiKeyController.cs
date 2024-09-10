using Chats.BE.Controllers.Users.ApiKeys.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Users.ApiKeys;

[Authorize, Route("api/user/api-key")]
public class ApiKeyController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ListApiKeyDto[]> ListMyApiKeys(CancellationToken cancellationToken)
    {
        ListApiKeyDto[] result = await db.ApiKeys
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .Select(x => new ListApiKeyDto
            {
                Id = x.Id,
                Key = x.Key,
                IsRevoked = x.IsRevoked,
                Comment = x.Comment,
                AllowEnumerate = x.AllowEnumerate,
                AllowAllModels = x.AllowAllModels,
                Expires = x.Expires,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                LastUsedAt = x.ApiUsages.MaxBy(x => x.Id)!.CreatedAt
            })
            .ToArrayAsync(cancellationToken);
        return result;
    }

    [HttpGet("{apiKeyId}")]
    public async Task<ActionResult<Guid[]>> GetApiKeySupportedModels(int apiKeyId, CancellationToken cancellationToken)
    {
        ApiKey? dbEntry = await db.ApiKeys
            .Include(x => x.Models)
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .Where(x => x.Id == apiKeyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (dbEntry is null) return NotFound();

        return Ok(dbEntry.Models.Select(x => x.Id).ToArray());
    }

    [HttpPost]
    public async Task<ListApiKeyDto> CreateApiKey(CancellationToken cancellationToken)
    {
        ApiKey dbEntry = new()
        {
            UserId = currentUser.Id,
            Key = $"sk-{Guid.NewGuid()}",
            Comment = $"New api key - {DateTime.UtcNow:yyyyMMdd}",
            IsRevoked = false, 
            IsDeleted = false, 
            AllowEnumerate = false,
            AllowAllModels = false,
            Expires = DateTime.UtcNow.AddYears(1),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.ApiKeys.Add(dbEntry);
        await db.SaveChangesAsync(cancellationToken);

        return new ListApiKeyDto()
        {
            Id = dbEntry.Id,
            Key = dbEntry.Key,
            IsRevoked = dbEntry.IsRevoked,
            Comment = dbEntry.Comment,
            AllowEnumerate = dbEntry.AllowEnumerate,
            AllowAllModels = dbEntry.AllowAllModels,
            Expires = dbEntry.Expires,
            CreatedAt = dbEntry.CreatedAt,
            UpdatedAt = dbEntry.UpdatedAt,
            LastUsedAt = null
        };
    }

    [HttpDelete("{apiKeyId}")]
    public async Task<ActionResult> DeleteApiKey(int apiKeyId, CancellationToken cancellationToken)
    {
        ApiKey? dbEntry = await db.ApiKeys
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .Where(x => x.Id == apiKeyId)
            .FirstOrDefaultAsync(cancellationToken);
        if (dbEntry == null) return NotFound();

        bool everUsed = await db.ApiUsages
            .AnyAsync(x => x.ApiKeyId == apiKeyId, cancellationToken);
        if (everUsed)
        {
            dbEntry.IsDeleted = true;
            dbEntry.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }
        else
        {
            db.ApiKeys.Remove(dbEntry);
            await db.SaveChangesAsync(cancellationToken);
        }

        return NoContent();
    }

    [HttpPut("{apiKeyId}")]
    public async Task<ActionResult> UpdateApiKey(int apiKeyId, UpdateApiKeyDto dto, CancellationToken cancellationToken)
    {
        ApiKey? dbEntry = await db.ApiKeys
            .Include(x => x.Models)
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .Where(x => x.Id == apiKeyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (dbEntry is null) return NotFound();

        dto.ApplyTo(dbEntry);
        if (db.ChangeTracker.HasChanges())
        {
            dbEntry.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }

        return NoContent();
    }
}
