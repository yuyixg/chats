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

    [HttpGet("balance-7-days-usage")]
    public async Task<ActionResult<Dictionary<DateTime, decimal>>> GetBalance7Days(int timezoneOffset, CancellationToken cancellationToken)
    {
        DateTime now = DateTime.UtcNow;
        DateTime start = now.AddDays(-days);
        DateTime[] dates = Enumerable.Range(0, days)
            .Select(day => now.AddMinutes(-timezoneOffset).AddDays(-day).Date)
            .ToArray();
        Dictionary<DateTime, decimal> history = (await db.TransactionLogs
            .Where(x => x.UserId == currentUser.Id && x.CreatedAt >= start && x.CreatedAt <= now && x.TransactionTypeId == (byte)DBTransactionType.Cost)
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

        return Ok(history);
    }

    [HttpGet("balance")]
    public async Task<ActionResult<LegacyBalanceDto>> GetLegacyBalance(CancellationToken cancellationToken)
    {
        decimal balance = await db.Users
            .Where(x => x.Id == currentUser.Id)
            .Select(x => x.UserBalance!.Balance)
            .FirstOrDefaultAsync(cancellationToken);
        LegacyBalanceLog[] logs = await db.TransactionLogs
            .Where(x => x.UserId == currentUser.Id && x.CreatedAt >= DateTime.UtcNow.AddDays(-days) && x.TransactionTypeId == (byte)DBTransactionType.Cost)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new LegacyBalanceLog
            {
                Date = x.CreatedAt,
                Amount = x.Amount,
            })
            .ToArrayAsync(cancellationToken);
        return Ok(new LegacyBalanceDto
        {
            Balance = balance,
            Logs = logs
        });
    }
}
