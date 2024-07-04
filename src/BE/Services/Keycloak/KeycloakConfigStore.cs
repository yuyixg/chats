using Chats.BE.DB;
using Chats.BE.Services.Common;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Chats.BE.Services.Keycloak;

public class KeycloakConfigStore(ChatsDB db)
{
    public async Task<KeycloakConfig?> GetKeycloakConfig(CancellationToken cancellationToken)
    {
        LoginService? loginService = await db.LoginServices.SingleOrDefaultAsync(s => s.Type == KnownLoginServices.Keycloak, cancellationToken);
        if (loginService == null)
        {
            return null;
        }

        return JsonSerializer.Deserialize<KeycloakConfig>(loginService.Configs);
    }
}
