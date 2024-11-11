using Chats.BE.DB;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services;

public class BalanceService(IServiceScopeFactory serviceScopeFactory)
{
    public Task AsyncUpdateBalance(Guid userId, CancellationToken cancellationToken)
    {
        return Task.Run(async () =>
        {
            using IServiceScope scope = serviceScopeFactory.CreateScope();
            using ChatsDB db = scope.ServiceProvider.GetRequiredService<ChatsDB>();
            await UpdateBalance(db, userId, cancellationToken);
        }, cancellationToken);
    }

    public async Task UpdateBalance(ChatsDB db, Guid userId, CancellationToken cancellationToken)
    {
        await db.UserBalances
            .Where(x => x.UserId == userId)
            .ExecuteUpdateAsync(userBalance => userBalance.SetProperty(p => p.Balance, v =>
                db.TransactionLogs
                    .Where(x => x.UserId == userId)
                    .Sum(x => x.Amount)
                ), cancellationToken);
    }

    public Task AsyncUpdateUserModelBalance(int userModelId, CancellationToken cancellationToken)
    {
        return Task.Run(async () =>
        {
            using IServiceScope scope = serviceScopeFactory.CreateScope();
            using ChatsDB db = scope.ServiceProvider.GetRequiredService<ChatsDB>();
            await UpdateUserModelBalance(db, userModelId, cancellationToken);
        }, cancellationToken);
    }

    public async Task UpdateUserModelBalance(ChatsDB db, int userModelId, CancellationToken cancellationToken)
    {
        await db.UserModel2s
            .Where(x => x.Id == userModelId)
            .ExecuteUpdateAsync(userModel => userModel
                .SetProperty(p => p.TokenBalance, v => db.UsageTransactionLogs.Where(x => x.UserModelId == userModelId).Sum(x => x.TokenAmount))
                .SetProperty(p => p.CountBalance, v => db.UsageTransactionLogs.Where(x => x.UserModelId == userModelId).Sum(x => x.CountAmount)), cancellationToken);
    }
}