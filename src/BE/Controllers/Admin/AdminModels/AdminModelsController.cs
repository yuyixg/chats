using Chats.BE.Controllers.Admin.Common;
using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.AdminModels;

[Route("api/admin/models"), AuthorizeAdmin]
public class AdminModelsController(ChatsDB db) : ControllerBase
{
    [HttpGet]
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
}
