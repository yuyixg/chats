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
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;
using System.Text.Json;

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
            })
            .AsAsyncEnumerable()
            .Select(x => x.ToDto())
            .ToArrayAsync(cancellationToken);
    }

    [HttpPut("models/{modelId:guid}")]
    public async Task<ActionResult> UpdateModel(Guid modelId, [FromBody] UpdateModelRequest req, CancellationToken cancellationToken)
    {
        Model? cm = await db.Models.FindAsync([modelId], cancellationToken);
        if (cm == null) return NotFound();

        req.ApplyTo(cm, db);
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
        Model toCreate = new()
        {
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        req.ApplyTo(toCreate, db);
        db.Models.Add(toCreate);
        await db.SaveChangesAsync(cancellationToken);

        return Created();
    }

    [HttpPost("models/validate")]
    public async Task<ActionResult> ValidateModel(
        [FromBody] ValidateModelRequest req,
        [FromServices] ConversationFactory conversationFactory,
        [FromServices] CurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        ModelKey2? modelKey = await db.ModelKey2s
            .Where(x => x.Id == req.ModelKeyId)
            .SingleOrDefaultAsync(cancellationToken);
        if (modelKey == null)
        {
            return this.BadRequestMessage("Model version not found");
        }

        ModelReference? modelReference = await db.ModelReferences
            .Where(x => x.Name == req.ModelReferenceId && x.ProviderId == modelKey.Id)
            .SingleOrDefaultAsync(cancellationToken);
        if (modelReference == null)
        {
            return this.BadRequestMessage("Model version not found");
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
        Dictionary<short, UserModel2> userModels = await db.UserModel2s
            .Where(x => x.UserId == currentUser.Id && !x.IsDeleted)
            .ToDictionaryAsync(k => k.ModelId, v => v, cancellationToken);

        // create or update user models
        foreach (JsonTokenBalance item in req.Models)
        {
            UserModelTransactionLog? logItem;
            if (userModels.TryGetValue(item.ModelId, out UserModel2? existingItem))
            {
                logItem = item.ApplyTo(existingItem);
            }
            else
            {
                UserModel2 newItem = new()
                {
                    UserId = currentUser.Id,
                    ModelId = item.ModelId,
                    CreatedAt = DateTime.UtcNow,
                };
                logItem = item.ApplyTo(newItem);
                userModels[item.ModelId] = newItem;
                db.UserModel2s.Add(newItem);
            }

            if (logItem != null)
            {
                db.UserModelTransactionLogs.Add(logItem);
            }
        }

        // delete user models
        foreach (KeyValuePair<short, UserModel2> kvp in userModels)
        {
            if (!req.Models.Any(x => x.ModelId == kvp.Key))
            {
                kvp.Value.IsDeleted = true;
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        foreach (int userModelId in userModels.Keys)
        {
            _ = balanceService.AsyncUpdateUserModelBalance(userModelId);
        }
        return NoContent();
    }
}
