using Chats.BE.Services.Sessions;
using System.Security.Claims;

namespace Chats.BE.Services.OpenAIApiKeySession;

public record ApiKeyEntry : SessionEntry
{
    public required int ApiKeyId { get; init; }
    public required string ApiKey { get; init; }
    public required DateTime Expires { get; init; }

    public override List<Claim> ToClaims()
    {
        return
        [
            ..base.ToClaims(),
            new Claim("api-key", ApiKey),
            new Claim("api-key-id", ApiKeyId.ToString())
        ];
    }
}
