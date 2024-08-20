using Chats.BE.Controllers.Chats.ModelUsage.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Chats.BE.Controllers.Chats.ModelUsage;

[Route("api/user/model-usage"), Authorize]
public class ModelUsageController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ModelUsageResponse>> GetUserModelUsage(Guid modelId, CancellationToken cancellationToken)
    {
        string? userModels = await db.UserModels
            .Where(x => x.UserId == currentUser.Id)
            .Select(x => x.Models)
            .SingleOrDefaultAsync(cancellationToken);
        if (userModels == null)
        {
            return NotFound();
        }

        JsonTokenBalance[] jsonUserModels = JsonSerializer.Deserialize<JsonTokenBalance[]>(userModels)!;
        JsonTokenBalance? userModel = jsonUserModels.FirstOrDefault(x => x.ModelId == modelId);
        if (userModel == null)
        {
            return NotFound();
        }
        if (!userModel.Enabled)
        {
            return NotFound();
        }

        string? priceConfig = await db.ChatModels
            .Where(x => x.Id == userModel.ModelId && x.Enabled)
            .Select(x => x.PriceConfig)
            .FirstOrDefaultAsync(cancellationToken);
        if (priceConfig == null)
        {
            return NotFound();
        }

        JsonPriceConfig jsonPrice = JsonSerializer.Deserialize<JsonPriceConfig>(priceConfig)!;
        JsonPriceConfig1M jsonPriceConfig1M = jsonPrice.To1M();
        return Ok(new ModelUsageResponse
        {
            Counts = userModel.Counts, 
            Expires = userModel.Expires,
            Prices = jsonPriceConfig1M.ToString(),
            Tokens = userModel.Tokens,
        });
    }
}
