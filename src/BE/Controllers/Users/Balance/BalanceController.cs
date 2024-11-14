using Chats.BE.Controllers.Users.Balance.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Users.Balance;

[Route("api/user"), Authorize]
public class BalanceController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    private const int days = 7;

    [HttpGet("balance-only")]
    public async Task<ActionResult<decimal>> GetBalanceOnly(CancellationToken cancellationToken)
    {
        decimal balance = await db.Users
            .Where(x => x.Id == currentUser.Id)
            .Select(x => x.UserBalance!.Balance)
            .FirstOrDefaultAsync(cancellationToken);
        return Ok(balance);
    }

    [HttpGet("7-days-usage")]
    public async Task<DailyCostDto[]> GetBalance7Days2(int timezoneOffset, CancellationToken cancellationToken)
    {
        DateTime now = DateTime.UtcNow;
        DateTime start = now.Date.AddDays(-days + 1).AddMinutes(timezoneOffset);
        DateTime[] dates = Enumerable.Range(0, days)
            .Select(day => now.AddMinutes(-timezoneOffset).AddDays(-day).Date)
            .ToArray();
        Dictionary<DateTime, decimal> history = (await db.BalanceTransactions
            .Where(x => x.UserId == currentUser.Id && x.CreatedAt >= start && x.CreatedAt <= now && 
                (x.TransactionTypeId == (byte)DBTransactionType.Cost || x.TransactionTypeId == (byte)DBTransactionType.ApiCost))
            .Select(x => new
            {
                Date = x.CreatedAt.AddMinutes(-timezoneOffset).Date, // Timezone
                Amount = -x.Amount,
            })
            .ToArrayAsync(cancellationToken))
            .GroupBy(x => x.Date)
            .ToDictionary(k => k.Key, v => v.Sum(y => y.Amount));

        foreach (DateTime date in dates)
        {
            if (!history.ContainsKey(date))
            {
                history[date] = 0;
            }
        }

        DailyCostDto[] result = [.. history
            .Select(x => new DailyCostDto
            {
                Date = new DateOnly(x.Key.Year, x.Key.Month, x.Key.Day),
                CostAmount = x.Value,
            })
            .OrderByDescending(x => x.Date)];

        return result;
    }
}
