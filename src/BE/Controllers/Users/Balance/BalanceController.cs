using Chats.BE.Controllers.Users.Balance.Dtos;
using Chats.BE.DB;
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

    [HttpGet("balance-7-days")]
    public async Task<ActionResult<Dictionary<DateOnly, decimal>>> GetBalance7Days(int timezoneOffset, CancellationToken cancellationToken)
    {
        DateTime now = DateTime.UtcNow;
        DateTime start = now.AddDays(-days);
        Dictionary<DateOnly, decimal> history = await db.BalanceLogs
            .Where(x => x.UserId == currentUser.Id && x.CreatedAt >= start && x.CreatedAt <= now)
            .Select(x => new
            {
                Date = DateOnly.FromDateTime(x.CreatedAt.AddMinutes(-timezoneOffset)), // Timezone
                Amount = x.Value,
            })
            .GroupBy(x => x.Date)
            .ToDictionaryAsync(k => k.Key, v => v.Sum(y => y.Amount), cancellationToken);

        DateOnly[] dates = Enumerable.Range(0, days)
            .Select(day => DateOnly.FromDateTime(start.AddMinutes(-timezoneOffset)).AddDays(-day))
            .ToArray();
        foreach (DateOnly date in dates)
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
        LegacyBalanceLog[] logs = await db.BalanceLogs
            .Where(x => x.UserId == currentUser.Id && x.CreatedAt >= DateTime.UtcNow.AddDays(-days))
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new LegacyBalanceLog
            {
                Date = x.CreatedAt,
                Amount = x.Value,
            })
            .ToArrayAsync(cancellationToken);
        return Ok(new LegacyBalanceDto
        {
            Balance = balance,
            Logs = logs
        });
    }
}
