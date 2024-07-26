using Chats.BE.DB;
using Chats.BE.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services;

public class BalanceService(IServiceScopeFactory serviceScopeFactory)
{
    public Task AsyncUpdateBalance(Guid userId)
    {
        return Task.Run(async () =>
        {
            using IServiceScope scope = serviceScopeFactory.CreateScope();
            ChatsDB db = scope.ServiceProvider.GetRequiredService<ChatsDB>();
            await db.UserBalances
                .Where(x => x.UserId == userId)
                .ExecuteUpdateAsync(userBalance => userBalance.SetProperty(p => p.Balance, v =>
                    db.BalanceLogs
                        .Where(x => x.UserId == userId)
                        .Sum(x => x.Type == (int)BalanceLogType.Initial || x.Type == (int)BalanceLogType.Charge ? x.Value : x.Type == (int)BalanceLogType.Cost ? -x.Value : 0)
                    ));
        });
    }

    public async Task InScopeUpdateBalance(ChatsDB db, Guid userId, CancellationToken cancellationToken)
    {
        await db.UserBalances
            .Where(x => x.UserId == userId)
            .ExecuteUpdateAsync(userBalance => userBalance.SetProperty(p => p.Balance, v =>
                db.BalanceLogs
                    .Where(x => x.UserId == userId)
                    .Sum(x => x.Type == (int)BalanceLogType.Initial || x.Type == (int)BalanceLogType.Charge ? x.Value : x.Type == (int)BalanceLogType.Cost ? -x.Value : 0)
                ), cancellationToken);
    }
}