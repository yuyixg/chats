using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.ModelKeys.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.Services.Common;
using Chats.BE.Services.Conversations;
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

    [HttpPost("{modelKeyId:int}/auto-create-models")]
    public async Task<ActionResult<AutoCreateModelResult[]>> AutoCreateModels(short modelKeyId, [FromServices] ConversationFactory conversationFactory, CancellationToken cancellationToken)
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

        HashSet<short> existingModelRefIds = modelKey.Models
            .Select(x => x.ModelReferenceId)
            .ToHashSet();

        ModelReference[] readyRefs = await db.ModelReferences
            .Include(x => x.CurrencyCodeNavigation)
            .Where(x => !x.IsLegacy && x.ProviderId == modelKey.ModelProviderId)
            .ToArrayAsync(cancellationToken);

        ParepareAutoCreateModelResult[] scanedModels = await Task.WhenAll(readyRefs
            .Select(async r => existingModelRefIds.Contains(r.Id)
                ? ParepareAutoCreateModelResult.ModelAlreadyExists(r)
                : ParepareAutoCreateModelResult.FromModelValidateResult(await conversationFactory.ValidateModel(modelKey, r, r.Name, cancellationToken), r)));

        FileService? fileService = await db.FileServices
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);
        AutoCreateModelResult[] results = await scanedModels
            .ToAsyncEnumerable()
            .SelectAwait(async (m) =>
            {
                if (!m.IsValidationPassed)
                {
                    return m.ToResult(null);
                }

                db.Models.Add(new Model
                {
                    ModelKeyId = modelKeyId,
                    ModelReferenceId = m.ModelReference.Id,
                    Name = m.ModelReference.Name,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    DeploymentName = null, // don't need to specify deploymentName because it's auto created
                    FileService = m.ModelReference.AllowSearch ? fileService : null,
                    IsDeleted = false,
                    PromptTokenPrice1M = m.ModelReference.PromptTokenPrice1M * m.ModelReference.CurrencyCodeNavigation.ExchangeRate,
                    ResponseTokenPrice1M = m.ModelReference.ResponseTokenPrice1M * m.ModelReference.CurrencyCodeNavigation.ExchangeRate,
                });
                try
                {
                    await db.SaveChangesAsync(cancellationToken);
                    return m.ToResult(null);
                }
                catch (Exception ex)
                {
                    return m.ToResult(ex.Message);
                }
            })
            .ToArrayAsync(cancellationToken);

        return Ok(results);
    }
}
