using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.Common;
using Chats.BE.Services.Keycloak;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Chats.BE.Services;

public class UserManager(ChatsDB db)
{
    public async Task<User?> FindUserBySub(string sub, CancellationToken cancellationToken)
    {
        return await db.Users.FirstOrDefaultAsync(x => x.Sub == sub, cancellationToken);
    }

    public async Task<User> EnsureKeycloakUser(AccessTokenInfo token, CancellationToken cancellationToken)
    {
        User? user = await FindUserBySub(token.Sub, cancellationToken);
        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(), 
                Provider = KnownLoginProviders.Keycloak,
                Sub = token.Sub,
                Account = token.GetSuggestedUserName(),
                Username = token.GetSuggestedUserName(),
                Password = null,
                Role = "-",
                Email = token.Email,
                Enabled = true, 
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            await InitializeUserWithoutSave(user, KnownLoginProviders.Keycloak, null, cancellationToken);
            db.Users.Add(user);
            await db.SaveChangesAsync(cancellationToken);
        }

        return user;
    }

    public async Task InitializeUserWithoutSave(User newUser, string? provider, string? invitationCode, CancellationToken cancellationToken)
    {
        newUser.UserBalance = new()
        {
            Id = Guid.NewGuid(),
            UserId = newUser.Id,
            Balance = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        provider ??= "-";
        UserInitialConfig? config = await db.UserInitialConfigs
            .OrderByDescending(x =>
                x.LoginType == provider ? 10 : 1 +
                x.InvitationCode!.Value == invitationCode ? 10 : 1)
            .FirstOrDefaultAsync(cancellationToken);

        if (provider == KnownLoginProviders.Phone && config == null)
        {
            // we don't allow phone login without invitation code
            throw new InvalidOperationException("Phone login without invitation code is not allowed");
        }

        if (config != null)
        {
            newUser.UserBalance.Balance = config.Price;
            JsonTokenBalance[] models = JsonSerializer.Deserialize<JsonTokenBalance[]>(config.Models)!;
            newUser.UserModel2s = models
                .Select(m =>
                {
                    UserModel2 toReturn = new()
                    {
                        ModelId = m.ModelId,
                        CreatedAt = DateTime.UtcNow,
                    };
                    m.ApplyTo(toReturn);
                    return toReturn;
                })
                .ToArray();
            db.TransactionLogs.Add(new TransactionLog()
            {
                UserId = newUser.Id,
                CreditUserId = newUser.Id,
                TransactionTypeId = (byte)DBTransactionType.Initial,
                CreatedAt = DateTime.UtcNow,
                Amount = config.Price,
            });
        }
    }
}
