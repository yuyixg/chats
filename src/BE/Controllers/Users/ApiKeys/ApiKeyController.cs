using Chats.BE.Controllers.Users.ApiKeys.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Numerics;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

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
                LastUsedAt = x.ApiUsage2s.FirstOrDefault(v => v.Id == x.ApiUsage2s.Select(x => x.Id).Max())!.CreatedAt, 
                ModelCount = x.Models.Count
            })
            .ToArrayAsync(cancellationToken);
        return result;
    }

    [HttpGet("{apiKeyId}")]
    public async Task<ActionResult<Guid[]>> GetApiKeySupportedModels(int apiKeyId, [FromServices] UserModelManager userModelManager, CancellationToken cancellationToken)
    {
        ApiKey? dbEntry = await db.ApiKeys
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .Where(x => x.Id == apiKeyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (dbEntry is null) return NotFound();
        if (dbEntry.AllowAllModels)
        {
            ChatModel[] allowedModels = await userModelManager.GetValidModelsByUserId(currentUser.Id, cancellationToken);
            return Ok(allowedModels.Select(x => x.Id).ToArray());
        }
        else
        {
            return Ok(dbEntry.Models.Select(x => x.Id).ToArray());
        }
    }

    [HttpPost]
    public async Task<ListApiKeyDto> CreateApiKey(CancellationToken cancellationToken)
    {
        const int keyLength = 48;
        ApiKey dbEntry = new()
        {
            UserId = currentUser.Id,
            Key = $"sk-{GenerateBase62Key(keyLength)}",
            Comment = $"New key",
            IsRevoked = false, 
            IsDeleted = false, 
            AllowEnumerate = true,
            AllowAllModels = true,
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
            LastUsedAt = null, 
            ModelCount = 0
        };
    }

    static string GenerateBase62Key(int length)
    {
        const string Base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        // Calculate the number of bytes needed to generate a secure key of the specified length
        int byteSize = (int)Math.Ceiling(length * 5.954196310386875 / 8);

        // Generate random bytes
        byte[] randomBytes = new byte[byteSize];
        RandomNumberGenerator.Fill(randomBytes);

        // Convert to BigInteger
        BigInteger bigInt = new(randomBytes, isUnsigned: true);

        // Build Base62 string
        StringBuilder base62 = new();
        while (bigInt > 0 && base62.Length < length)
        {
            bigInt = BigInteger.DivRem(bigInt, 62, out BigInteger remainder);
            base62.Insert(0, Base62Chars[(int)remainder]);
        }

        // Pad the key if it's shorter than the desired length
        while (base62.Length < length)
        {
            base62.Insert(0, '0');
        }

        return base62.ToString();
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
    public async Task<ActionResult> UpdateApiKey(int apiKeyId, [FromBody] UpdateApiKeyDto dto, CancellationToken cancellationToken)
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
