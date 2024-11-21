using Chats.BE.DB;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services;

public class UserModelManager(ChatsDB db)
{
    public async Task<UserModel?> GetUserModel(int userId, short modelId, CancellationToken cancellationToken)
    {
        UserModel? balances = await db.UserModels
            .Include(x => x.Model)
            .Include(x => x.Model.ModelReference)
            .Include(x => x.Model.ModelReference.Tokenizer)
            .Include(x => x.Model.ModelKey)
            .Include(x => x.Model.ModelKey.ModelProvider)
            .Include(x => x.Model.ModelReference.CurrencyCodeNavigation)
            .Include(x => x.Model.FileService)
            .Where(x => x.UserId == userId && !x.IsDeleted && !x.Model.IsDeleted && x.ModelId == modelId)
            .FirstOrDefaultAsync(cancellationToken);

        return balances;
    }

    private async Task<UserModel?> GetUserModel(int userId, string modelName, CancellationToken cancellationToken)
    {
        UserModel? balances = await db.UserModels
            .Include(x => x.Model)
            .Include(x => x.Model.ModelReference)
            .Include(x => x.Model.ModelReference.Tokenizer)
            .Include(x => x.Model.ModelKey)
            .Include(x => x.Model.ModelKey.ModelProvider)
            .Include(x => x.Model.ModelReference.CurrencyCodeNavigation)
            .Include(x => x.Model.FileService)
            .Where(x => x.UserId == userId && !x.IsDeleted && !x.Model.IsDeleted && x.Model.Name == modelName)
            .FirstOrDefaultAsync(cancellationToken);

        return balances;
    }

    public async Task<UserModel?> GetUserModel(string apiKey, string modelName, CancellationToken cancellationToken)
    {
        UserApiKey? key = await db.UserApiKeys
            .Include(x => x.Models)
            .Where(x => x.Key == apiKey && x.Expires > DateTime.UtcNow)
            .FirstOrDefaultAsync(cancellationToken);
        if (key == null) return null;

        UserModel? userModel = await GetUserModel(key.UserId, modelName, cancellationToken);
        if (key.AllowAllModels || userModel != null && key.Models.Select(x => x.Id).Contains(userModel.ModelId))
        {
            return userModel;
        }
        else
        {
            return null;
        }
    }

    public async Task<UserModel[]> GetValidModelsByUserId(int userId, CancellationToken cancellationToken)
    {
        UserModel[] balances = await db.UserModels
            .Include(x => x.Model)
            .Include(x => x.Model.ModelReference)
            .Include(x => x.Model.ModelReference.Tokenizer)
            .Include(x => x.Model.ModelKey)
            .Include(x => x.Model.ModelKey.ModelProvider)
            .Include(x => x.Model.ModelReference.CurrencyCodeNavigation)
            .Include(x => x.Model.FileService)
            .Where(x => x.UserId == userId && !x.IsDeleted && !x.Model.IsDeleted)
            .OrderBy(x => x.Model.Order)
            .ToArrayAsync(cancellationToken);

        return balances;
    }

    public async Task<UserModel[]> GetValidModelsByApiKey(string apiKey, CancellationToken cancellationToken)
    {
        UserApiKey? key = await db.UserApiKeys
            .Include(x => x.Models)
            .Where(x => x.Key == apiKey && x.Expires > DateTime.UtcNow)
            .FirstOrDefaultAsync(cancellationToken);
        if (key == null) return [];

        UserModel[] allPossibleModels = await GetValidModelsByUserId(key.UserId, cancellationToken);
        if (key.AllowAllModels)
        {
            return allPossibleModels;
        }
        else
        {
            HashSet<short> selectedModels = key.Models.Select(x => x.Id).ToHashSet();
            return allPossibleModels
                .Where(x => selectedModels.Contains(x.ModelId))
                .ToArray();
        }
    }
}
