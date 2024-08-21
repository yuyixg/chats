using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.ModelKeys.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Chats.BE.Controllers.Admin.ModelKeys;

[Route("api/admin/model-keys"), AuthorizeAdmin]
public class ModelKeysController(ChatsDB db) : ControllerBase
{
    [HttpGet]
    public ActionResult<ModelKeyDto[]> GetAllModelKeys()
    {
        ModelKeyDto[] result = db.ModelKeys
            .OrderByDescending(x => x.UpdatedAt)
            .Select(x => new ModelKeyDtoTemp
            {
                Id = x.Id,
                Type = x.Type,
                Name = x.Name,
                Configs = x.Configs,
                CreatedAt = x.CreatedAt,
            })
            .AsEnumerable()
            .Select(x => x.ToDto())
            .ToArray();

        return Ok(result);
    }

    [HttpPut("{modelKeyId}")]
    public async Task<ActionResult> UpdateModelKey(Guid modelKeyId, [FromBody] UpdateModelKeyRequest request, CancellationToken cancellationToken)
    {
        ModelKey? modelKey = await db.ModelKeys
            .FirstOrDefaultAsync(x => x.Id == modelKeyId, cancellationToken);
        if (modelKey == null)
        {
            return NotFound();
        }

        modelKey.Type = request.Type;
        modelKey.Name = request.Name;
        JsonModelKey currentKey = JsonSerializer.Deserialize<JsonModelKey>(modelKey.Configs)!;
        JsonModelKey passingInKey = JsonSerializer.Deserialize<JsonModelKey>(request.Configs)!;
        if (!currentKey.IsMaskedEquals(passingInKey))
        {
            modelKey.Configs = request.Configs;
        }
        if (db.ChangeTracker.HasChanges())
        {
            modelKey.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult> CreateModelKey([FromBody] UpdateModelKeyRequest request, CancellationToken cancellationToken)
    {
        // ensure request.Configs is a valid JsonModelKey
        JsonSerializer.Deserialize<JsonModelKey>(request.Configs);

        ModelKey newModelKey = new()
        {
            Id = Guid.NewGuid(),
            Type = request.Type,
            Name = request.Name,
            Configs = request.Configs,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.ModelKeys.Add(newModelKey);
        await db.SaveChangesAsync(cancellationToken);

        return Created();
    }

    [HttpDelete("{modelKeyId}")]
    public async Task<ActionResult> DeleteModelKey(Guid modelKeyId, CancellationToken cancellationToken)
    {
        if (await db.ChatModels.AnyAsync(m => m.ModelKeysId == modelKeyId, cancellationToken))
        {
            return this.BadRequestMessage("Model key is in use");
        }

        ModelKey? modelKey = await db.ModelKeys
            .FirstOrDefaultAsync(x => x.Id == modelKeyId, cancellationToken);
        if (modelKey == null)
        {
            return NotFound();
        }

        db.ModelKeys.Remove(modelKey);
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
