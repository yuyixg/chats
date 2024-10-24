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
    public async Task<ActionResult<ModelUsageResponse>> GetUserModelUsage(short modelId, CancellationToken cancellationToken)
    {
        UserModel2? userModel = await db.UserModel2s
            .Include(x => x.Model)
            .Where(x => x.UserId == currentUser.Id && x.ModelId == modelId && !x.IsDeleted)
            .SingleOrDefaultAsync(cancellationToken);
        if (userModel == null)
        {
            return NotFound();
        }

        if (userModel.IsExpired)
        {
            return NotFound();
        }

        return Ok(new ModelUsageResponse
        {
            Counts = userModel.CountBalance.ToString(), 
            Expires = userModel.ExpiresAt.ToString(),
            Prices = new JsonPriceConfig1M(userModel.Model.PromptTokenPrice1M, userModel.Model.ResponseTokenPrice1M).ToString(),
            Tokens = userModel.TokenBalance.ToString(),
        });
    }
}
