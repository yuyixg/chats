using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.ModelKeys.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Services;
using Chats.BE.Services.Common;
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
        ModelKeyDto[] result = db.ModelKey2s
            .OrderByDescending(x => x.UpdatedAt)
            .Select(x => new ModelKeyDtoTemp
            {
                Id = x.Id,
                ProviderName = x.ModelProvider.Name,
                Name = x.Name,
                Host = x.Host,
                Secret = x.Secret,
                CreatedAt = x.CreatedAt,
                EnabledModelCount = x.Models.Count(x => !x.IsDeleted),
                TotalModelCount = x.Models.Count
            })
            .AsEnumerable()
            .Select(x => x.ToDto())
            .ToArray();

        return Ok(result);
    }

    [HttpPut("{modelKeyId}")]
    public async Task<ActionResult> UpdateModelKey(short modelKeyId, [FromBody] UpdateModelKeyRequest request, CancellationToken cancellationToken)
    {
        ModelKey2? modelKey = await db.ModelKey2s
            .FirstOrDefaultAsync(x => x.Id == modelKeyId, cancellationToken);
        if (modelKey == null)
        {
            return NotFound();
        }

        short? modelProviderId = db.ModelProviders
            .First(x => x.Name == request.Type)
            .Id;
        if (modelProviderId == null)
        {
            return this.BadRequestMessage("Invalid model provider");
        }
        modelKey.ModelProviderId = modelProviderId.Value;
        modelKey.Name = request.Name;
        JsonModelKey passingInKey = JsonSerializer.Deserialize<JsonModelKey>(request.Configs)!;
        if (!modelKey.Secret.IsMaskedEquals(passingInKey.Secret))
        {
            modelKey.Secret = passingInKey.Secret;
        }
        modelKey.Host = passingInKey.Host;
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
        JsonModelKey jsonModelKey = JsonSerializer.Deserialize<JsonModelKey>(request.Configs)!;

        short? modelProviderId = db.ModelProviders
            .First(x => x.Name == request.Type)
            .Id;
        if (modelProviderId == null)
        {
            return this.BadRequestMessage("Invalid model provider");
        }

        ModelKey2 newModelKey = new()
        {
            ModelProviderId = modelProviderId.Value,
            Name = request.Name,
            Host = jsonModelKey.Host,
            Secret = jsonModelKey.Secret,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.ModelKey2s.Add(newModelKey);
        await db.SaveChangesAsync(cancellationToken);

        return Created();
    }

    [HttpDelete("{modelKeyId}")]
    public async Task<ActionResult> DeleteModelKey(short modelKeyId, CancellationToken cancellationToken)
    {
        if (await db.Models.AnyAsync(m => m.ModelKeyId == modelKeyId, cancellationToken))
        {
            return this.BadRequestMessage("Model key is in use");
        }

        ModelKey2? modelKey = await db.ModelKey2s
            .FirstOrDefaultAsync(x => x.Id == modelKeyId, cancellationToken);
        if (modelKey == null)
        {
            return NotFound();
        }

        db.ModelKey2s.Remove(modelKey);
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
