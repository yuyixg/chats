using Chats.BE.Controllers.Admin.UserBalances.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Chats.BE.Controllers.Admin.UserBalances;

[Route("api/admin/user-balances"), Authorize(Roles = "admin")]
public class UserBalancesController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpPut]
    public async Task<ActionResult<decimal>> ChargeBalance([FromBody] ChargeBalanceRequest request, CancellationToken cancellationToken)
    {
        using IDbContextTransaction transaction = await db.Database.BeginTransactionAsync(cancellationToken);

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
        await db.UserBalances
            .Where(x => x.UserId == request.UserId)
            .ExecuteUpdateAsync(userBalance => userBalance.SetProperty(p => p.Balance, v =>
                db.BalanceLogs
                    .Where(x => x.UserId == request.UserId)
                    .Sum(x => x.Type == (int)BalanceLogType.Initial || x.Type == (int)BalanceLogType.Charge ? x.Value : x.Type == (int)BalanceLogType.Cost ? -x.Value : 0)
                ), cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return await db.UserBalances
            .Where(x => x.UserId == request.UserId)
            .Select(x => x.Balance)
            .SingleOrDefaultAsync(cancellationToken);
    }
}

