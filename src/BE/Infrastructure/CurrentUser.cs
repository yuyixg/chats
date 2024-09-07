using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace Chats.BE.Infrastructure;

public class CurrentUser
{
    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        var httpContext = httpContextAccessor.HttpContext ?? throw new InvalidOperationException("HttpContext is null");

        Id = Guid.TryParse(httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier), out Guid guid) ? guid : throw new InvalidOperationException("User id is not a guid");
        DisplayName = httpContext.User.FindFirstValue(ClaimTypes.Name) ?? throw new InvalidOperationException("User name is null");
        Role = httpContext.User.FindFirstValue(ClaimTypes.Role) ?? throw new InvalidOperationException("User role is null");
        Provider = httpContext.User.FindFirstValue("provider");
        ProviderSub = httpContext.User.FindFirstValue("provider-sub");
    }

    public Guid Id { get; }
    public string DisplayName { get; }
    public string Role { get; }
    public string? Provider { get; }
    public string? ProviderSub { get; }

    public async Task<ChatModel[]> GetValidModels(ChatsDB db, CancellationToken cancellationToken)
    {
        string? userModels = await db.UserModels
            .Where(x => x.UserId == Id)
            .Select(x => x.Models)
            .FirstOrDefaultAsync(cancellationToken);
        if (userModels == null) return [];

        JsonTokenBalance[] balances = (JsonSerializer.Deserialize<JsonTokenBalance[]>(userModels) ?? [])
            .Where(x => x.Enabled)
            .ToArray();
        if (balances.Length == 0) return [];

        ChatModel[] validModels = await db.ChatModels
            .Include(x => x.ModelKeys)
            .Where(x => balances.Select(x => x.ModelId).Contains(x.Id) && x.Enabled)
            .OrderBy(x => x.Rank)
            .ToArrayAsync(cancellationToken);

        return validModels;
    }
}