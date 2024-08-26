using Chats.BE.Controllers.Admin.AdminModels.Dtos;
using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.AdminModels;

[Route("api/admin"), AuthorizeAdmin]
public class AdminModelsController(ChatsDB db) : ControllerBase
{
    [HttpGet("models")]
    public async Task<ActionResult<AdminModelDto[]>> GetAdminModels(bool all, CancellationToken cancellationToken)
    {
        IQueryable<ChatModel> query = db.ChatModels;
        if (!all) query = query.Where(x => x.Enabled);

        return await query
            .OrderBy(x => x.Rank)
            .Select(x => new AdminModelDtoTemp
            {
                Enabled = x.Enabled,
                FileConfig = x.FileConfig,
                FileServiceId = x.FileServiceId,
                ModelConfig = x.ModelConfig,
                ModelId = x.Id,
                ModelKeysId = x.ModelKeysId,
                ModelProvider = x.ModelProvider,
                ModelVersion = x.ModelVersion,
                Name = x.Name,
                PriceConfig = x.PriceConfig,
                Rank = x.Rank,
                Remarks = x.Remarks,
            })
            .AsAsyncEnumerable()
            .Select(x => x.ToDto())
            .ToArrayAsync(cancellationToken);
    }

    [HttpPut("models")]
    public async Task<ActionResult> UpdateModel([FromBody] UpdateModelRequest req, CancellationToken cancellationToken)
    {
        ChatModel? cm = await db.ChatModels.FindAsync(req.ModelId, cancellationToken);
        if (cm == null) return NotFound();

        if (cm.ModelVersion != req.ModelVersion)
        {
            string? newModelProvider = await db.ModelSettings
                .Where(x => x.Type == req.ModelVersion)
                .Select(x => x.Provider.Name)
                .SingleOrDefaultAsync(cancellationToken);
            if (newModelProvider == null)
            {
                return this.BadRequestMessage("Model version not found");
            }

            cm.ModelProvider = newModelProvider;
        }
        req.ApplyTo(cm);
        if (db.ChangeTracker.HasChanges())
        {
            cm.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }

        return NoContent();
    }

    [HttpPut("user-models")]
    public async Task<ActionResult> UpdateUserModels([FromBody] UpdateUserModelRequest req, CancellationToken cancellationToken)
    {
        UserModel? userModel = await db.UserModels
            .FindAsync(req.UserModelId, cancellationToken);
        if (userModel == null) return NotFound();

        userModel.UpdatedAt = DateTime.UtcNow;
        userModel.Models = JSON.Serialize(req.Models.Where(x => x.Enabled));
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
