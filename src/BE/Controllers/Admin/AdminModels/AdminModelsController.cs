using Chats.BE.Controllers.Admin.AdminModels.Dtos;
using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.Conversations.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;

namespace Chats.BE.Controllers.Admin.AdminModels;

[Route("api/admin"), AuthorizeAdmin]
public class AdminModelsController(ChatsDB db) : ControllerBase
{
    [HttpGet("models")]
    public async Task<ActionResult<AdminModelDto[]>> GetAdminModels(bool all, CancellationToken cancellationToken)
    {
        IQueryable<Model> query = db.Models;
        if (!all) query = query.Where(x => !x.IsDeleted);

        return await query
            .OrderBy(x => x.Order)
            .Select(x => new AdminModelDtoTemp
            {
                Enabled = !x.IsDeleted,
                FileServiceId = x.FileServiceId,
                ModelId = x.Id,
                ModelKeysId = x.ModelKeyId,
                ModelProvider = x.ModelKey.ModelProvider.Name,
                ModelVersion = x.ModelReference.Name,
                Name = x.Name,
                PromptTokenPrice1M = x.PromptTokenPrice1M,
                ResponseTokenPrice1M = x.ResponseTokenPrice1M,
                Rank = x.Order,
                DeploymentName = x.DeploymentName,
                EnableSearch = x.ModelReference.AllowSearch,
                MaxResponseTokens = x.ModelReference.MaxResponseTokens,
            })
            .AsAsyncEnumerable()
            .Select(x => x.ToDto())
            .ToArrayAsync(cancellationToken);
    }

    [HttpPut("models/{modelId:int}")]
    public async Task<ActionResult> UpdateModel(short modelId, [FromBody] UpdateModelRequest req, CancellationToken cancellationToken)
    {
        short modelReferenceId = await db.ModelReferences
            .Where(x => x.Name == req.ModelReferenceName && x.ProviderId == db.ModelKeys.Where(x => x.Id == req.ModelKeyId).Select(x => x.ModelProviderId).First())
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (modelReferenceId == 0)
        {
            return this.BadRequestMessage($"Invalid ModelReferenceName: {req.ModelReferenceName}");
        }

        Model? cm = await db.Models.FindAsync([modelId], cancellationToken);
        if (cm == null) return NotFound();

        req.ApplyTo(modelReferenceId, cm);
        if (db.ChangeTracker.HasChanges())
        {
            cm.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }

        return NoContent();
    }

    [HttpPost("models")]
    public async Task<ActionResult> CreateModel([FromBody] UpdateModelRequest req, CancellationToken cancellationToken)
    {
        short modelReferenceId = await db.ModelReferences
            .Where(x => x.Name == req.ModelReferenceName && x.ProviderId == db.ModelKeys.Where(x => x.Id == req.ModelKeyId).Select(x => x.ModelProviderId).First())
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (modelReferenceId == 0)
        {
            return this.BadRequestMessage($"Invalid ModelReferenceName: {req.ModelReferenceName}");
        }

        Model toCreate = new()
        {
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        req.ApplyTo(modelReferenceId, toCreate);
        db.Models.Add(toCreate);
        await db.SaveChangesAsync(cancellationToken);

        return Created();
    }

    [HttpPost("models/validate")]
    public async Task<ActionResult> ValidateModel(
        [FromBody] ValidateModelRequest req,
        [FromServices] ConversationFactory conversationFactory,
        CancellationToken cancellationToken)
    {
        ModelKey? modelKey = await db.ModelKeys
            .Include(x => x.ModelProvider)
            .Where(x => x.Id == req.ModelKeyId)
            .SingleOrDefaultAsync(cancellationToken);
        if (modelKey == null)
        {
            return this.BadRequestMessage($"Model key id: {req.ModelKeyId} not found");
        }

        ModelReference? modelReference = await db.ModelReferences
            .Include(x => x.Provider)
            .Where(x => x.Name == req.ModelReferenceId && x.ProviderId == modelKey.Id)
            .SingleOrDefaultAsync(cancellationToken);
        if (modelReference == null)
        {
            return this.BadRequestMessage($"Model reference id: {req.ModelReferenceId} not found");
        }

        ConversationService s = conversationFactory.CreateConversationService(new Model()
        {
            ModelKey = modelKey,
            ModelReference = modelReference,
            DeploymentName = req.DeploymentName,
        });
        try
        {
            await foreach (ConversationSegment seg in s.ChatStreamed([new UserChatMessage("1+1=?")], new ChatCompletionOptions(), cancellationToken))
            {
            }
            return Ok();
        }
        catch (Exception e)
        {
            return this.BadRequestMessage(e.Message);
        }
    }

    [HttpPut("user-models")]
    public async Task<ActionResult> UpdateUserModels([FromBody] UpdateUserModelRequest req, 
        [FromServices] CurrentUser currentUser,
        [FromServices] BalanceService balanceService,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return this.BadRequestMessage(string.Join("\n", ModelState
                .Skip(1)
                .Where(x => x.Value != null && x.Value.ValidationState == ModelValidationState.Invalid)
                .Select(x => $"{x.Key}: " + string.Join(",", x.Value!.Errors.Select(x => x.ErrorMessage)))));
        }

        Dictionary<short, UserModel> userModels = await db.UserModels
            .Where(x => x.UserId == currentUser.Id)
            .ToDictionaryAsync(k => k.ModelId, v => v, cancellationToken);

        // create or update user models
        foreach (JsonTokenBalance item in req.Models)
        {
            if (userModels.TryGetValue(item.ModelId, out UserModel? existingItem))
            {
                item.ApplyTo(existingItem);
            }
            else
            {
                UserModel newItem = new()
                {
                    UserId = currentUser.Id,
                    ModelId = item.ModelId,
                    CreatedAt = DateTime.UtcNow,
                };
                item.ApplyTo(newItem);
                userModels[item.ModelId] = newItem;
                db.UserModels.Add(newItem);
            }
        }

        // delete user models
        foreach (KeyValuePair<short, UserModel> kvp in userModels)
        {
            if (!req.Models.Any(x => x.ModelId == kvp.Key))
            {
                kvp.Value.UpdatedAt = DateTime.UtcNow;
                kvp.Value.IsDeleted = true;
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        foreach (int userModelId in userModels.Keys)
        {
            _ = balanceService.AsyncUpdateUserModelBalance(userModelId, CancellationToken.None);
        }
        return NoContent();
    }
}
