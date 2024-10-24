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

        req.ApplyTo(cm);
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
        req.ApplyTo(toCreate);
        db.Models.Add(toCreate);
        await db.SaveChangesAsync(cancellationToken);

        return Created();
    }

    [HttpPost("models/validate")]
    public async Task<ActionResult> ValidateModel(
        [FromBody] UpdateModelRequest req, 
        [FromServices] ConversationFactory conversationFactory,
        [FromServices] CurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        ModelKey2? modelProvider = await db.ModelKey2s
            .Where(x => x.Id == req.ModelKeyId)
            .SingleOrDefaultAsync(cancellationToken);
        if (modelProvider == null)
        {
            return this.BadRequestMessage("Model version not found");
        }

        ConversationService s = conversationFactory.CreateConversationService(Enum.Parse<KnownModelProvider>(modelProvider.Type), modelProvider.Configs, req.ModelConfig, req.ModelReferenceName);
        try
        {
            await foreach (ConversationSegment seg in s.ChatStreamed([new UserChatMessage("1+1=?")], new JsonUserModelConfig { }, currentUser, cancellationToken))
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
    public async Task<ActionResult> UpdateUserModels([FromBody] UpdateUserModelRequest req, CancellationToken cancellationToken)
    {
        UserModel2? userModel = await db.UserModel2s
            .FindAsync([req.UserModelId], cancellationToken);
        if (userModel == null) return NotFound();

        userModel.UpdatedAt = DateTime.UtcNow;
        userModel.Models = JSON.Serialize(req.Models.Where(x => x.Enabled));
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
