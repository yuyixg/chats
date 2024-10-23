using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Chats.BE.Services;

public class UserModelManager(ChatsDB db)
{
    public async Task<Model[]> GetValidModelsByUserId(Guid userId, CancellationToken cancellationToken)
    {
        UserModel2[] balances = await db.UserModel2s
            .Include(x => x.Model)
            .Include(x => x.Model.ModelReference)
            .Include(x => x.Model.ModelKey)
            .Include(x => x.Model.ModelKey.ModelProvider)
            .Where(x => x.UserId == userId && !x.IsDeleted && !x.Model.IsDeleted)
            .ToArrayAsync(cancellationToken);

        return balances.Select(x => x.Model).ToArray();
    }

    public async Task<Model[]> GetValidModelsByApiKey(string apiKey, CancellationToken cancellationToken)
    {
        ApiKey? key = await db.ApiKeys
            .Include(x => x.Models)
            .Where(x => x.Key == apiKey && x.Expires > DateTime.UtcNow)
            .FirstOrDefaultAsync(cancellationToken);
        if (key == null) return [];

        Model[] allPossibleModels = await GetValidModelsByUserId(key.UserId, cancellationToken);
        if (key.AllowAllModels)
        {
            return allPossibleModels;
        }
        else
        {
            HashSet<short> selectedModels = key.Models.Select(x => x.Id).ToHashSet();
            return allPossibleModels
                .Where(x => selectedModels.Contains(x.Id))
                .ToArray();
        }
    }
}
