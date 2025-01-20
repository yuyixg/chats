using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.ModelKeys.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.Services.Common;
using Chats.BE.Services.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.ModelKeys;

[Route("api/admin/model-keys"), AuthorizeAdmin]
public class ModelKeysController(ChatsDB db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ModelKeyDto[]>> GetAllModelKeys(CancellationToken cancellationToken)
    {
        ModelKeyDto[] result = await db.ModelKeys
            .OrderBy(x => x.ModelProviderId)
            .ThenBy(x => x.Id)
            .Select(x => new ModelKeyDto
            {
                Id = x.Id,
                ModelProviderId = x.ModelProviderId,
                Name = x.Name,
                Host = x.Host,
                Secret = x.Secret,
                CreatedAt = x.CreatedAt,
                EnabledModelCount = x.Models.Count(x => !x.IsDeleted),
                TotalModelCount = x.Models.Count
            })
            .ToArrayAsync(cancellationToken);

        for (int i = 0; i < result.Length; i++)
        {
            ModelKeyDto modelKey = result[i];
            result[i] = modelKey.WithMaskedKeys();
        }

        return Ok(result);
    }

    [HttpPut("{modelKeyId}")]
    public async Task<ActionResult> UpdateModelKey(short modelKeyId, [FromBody] UpdateModelKeyRequest request, CancellationToken cancellationToken)
    {
        ModelKey? modelKey = await db.ModelKeys
            .FirstOrDefaultAsync(x => x.Id == modelKeyId, cancellationToken);
        if (modelKey == null)
        {
            return NotFound();
        }

        if (!await db.ModelProviders.AnyAsync(x => x.Id == request.ModelProviderId, cancellationToken))
        {
            return this.BadRequestMessage("Invalid model provider");
        }
        modelKey.ModelProviderId = request.ModelProviderId;
        modelKey.Name = request.Name;
        if (!modelKey.Secret.IsMaskedEquals(request.Secret))
        {
            modelKey.Secret = request.Secret;
        }
        modelKey.Host = request.Host;
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
        if (!await db.ModelProviders.AnyAsync(x => x.Id == request.ModelProviderId, cancellationToken))
        {
            return this.BadRequestMessage("Invalid model provider");
        }

        ModelKey newModelKey = new()
        {
            ModelProviderId = request.ModelProviderId,
            Name = request.Name,
            Host = request.Host,
            Secret = request.Secret,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.ModelKeys.Add(newModelKey);
        await db.SaveChangesAsync(cancellationToken);

        return Created(default(string), value: newModelKey.Id);
    }

    [HttpDelete("{modelKeyId}")]
    public async Task<ActionResult> DeleteModelKey(short modelKeyId, CancellationToken cancellationToken)
    {
        if (await db.Models.AnyAsync(m => m.ModelKeyId == modelKeyId, cancellationToken))
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

    [HttpGet("{modelKeyId:int}/possible-models")]
    public async Task<ActionResult<PossibleModelDto[]>> ListModelKeyPossibleModels(short modelKeyId, CancellationToken cancellationToken)
    {
        ModelKey? modelKey = await db
           .ModelKeys
           .Include(x => x.Models)
           .AsSplitQuery()
           .FirstOrDefaultAsync(x => x.Id == modelKeyId, cancellationToken);

        if (modelKey == null)
        {
            return NotFound();
        }

        PossibleModelDto[] readyRefs = await db.ModelReferences
            .Where(x => x.ProviderId == modelKey.ModelProviderId)
            .OrderBy(x => x.Name)
            .Select(x => new PossibleModelDto()
            {
                DeploymentName = x.Models.FirstOrDefault(m => m.ModelKeyId == modelKeyId)!.DeploymentName,
                ReferenceId = x.Id,
                ReferenceName = x.Name,
                IsLegacy = x.IsLegacy,
                IsExists = x.Models.Any(m => m.ModelKeyId == modelKeyId),
            })
            .OrderBy(x => (x.IsLegacy ? 1 : 0) + (x.IsExists ? 2 : 0))
            .ThenByDescending(x => x.ReferenceId)
            .ToArrayAsync(cancellationToken);

        return Ok(readyRefs);
    }
}
