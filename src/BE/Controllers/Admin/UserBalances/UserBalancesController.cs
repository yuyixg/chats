using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.UserBalances.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.UserBalances;

[Route("api/admin/user-balances"), AuthorizeAdmin]
public class UserBalancesController(ChatsDB db, CurrentUser currentUser, BalanceService balanceService) : ControllerBase
{
    [HttpPut]
    public async Task<ActionResult<decimal>> ChargeBalance([FromBody] ChargeBalanceRequest request, CancellationToken cancellationToken)
    {
        db.BalanceLogs.Add(new BalanceLog
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Value = request.Amount,
            Type = (int)BalanceLogType.Charge,
            CreatedAt = DateTime.UtcNow,
            CreateUserId = currentUser.Id,
            UpdatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
        await balanceService.InScopeUpdateBalance(db, request.UserId, cancellationToken);

        return await db.UserBalances
            .Where(x => x.UserId == request.UserId)
            .Select(x => x.Balance)
            .SingleOrDefaultAsync(cancellationToken);
    }
}

