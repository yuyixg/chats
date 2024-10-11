using System.Security.Claims;

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

    public bool IsAdmin => Role == "admin";
}