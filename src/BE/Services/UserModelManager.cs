using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Chats.BE.Services;

public class UserModelManager(ChatsDB db)
{
    public async Task<ChatModel[]> GetValidModelsByUserId(Guid userId, CancellationToken cancellationToken)
    {
        string? userModels = await db.UserModels
            .Where(x => x.UserId == userId)
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

    public async Task<ChatModel[]> GetValidModelsByApiKey(string apiKey, CancellationToken cancellationToken)
    {
        ApiKey? key = await db.ApiKeys
            .Where(x => x.Key == apiKey && x.Expires > DateTime.UtcNow)
            .FirstOrDefaultAsync(cancellationToken);
        if (key == null) return [];

        ChatModel[] allPossibleModels = await GetValidModelsByUserId(key.UserId, cancellationToken);
        if (key.AllowAllModels)
        {
            return allPossibleModels;
        }
        else
        {
            HashSet<Guid> selectedModels = key.Models.Select(x => x.Id).ToHashSet();
            return allPossibleModels
                .Where(x => selectedModels.Contains(x.Id))
                .ToArray();
        }
    }
}
