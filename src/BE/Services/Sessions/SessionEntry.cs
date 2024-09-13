using System.Security.Claims;

namespace Chats.BE.Services.Sessions;

public record SessionEntry
{
    public required Guid UserId { get; init; }
    public required string UserName { get; init; }
    public required string Role { get; init; }
    public required string? Provider { get; init; }
    public required string? Sub { get; init; }

    public virtual List<Claim> ToClaims()
    {
        List<Claim> claims =
        [
            new Claim(ClaimTypes.NameIdentifier, UserId.ToString()),
            new Claim(ClaimTypes.Name, UserName),
            new Claim(ClaimTypes.Role, Role)
        ];

        if (Provider != null)
        {
            claims.Add(new Claim("provider", Provider));
        }

        if (Sub != null)
        {
            claims.Add(new Claim("provider-sub", Sub));
        }
        return claims;
    }
}
