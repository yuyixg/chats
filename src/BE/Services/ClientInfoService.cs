using Chats.BE.DB;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services;

public class ClientInfoService(IHttpContextAccessor httpContextAccessor, ChatsDB db)
{
    public async Task<ClientInfo> GetClientInfo(CancellationToken cancellationToken)
    {
        HttpContext context = httpContextAccessor.HttpContext ?? throw new InvalidOperationException("HttpContext is not available.");
        string ip =
            context!.Request.Headers["X-Forwarded-For"].FirstOrDefault() ??
            context!.Connection.RemoteIpAddress!.ToString();
        string userAgent = context!.Request.Headers.UserAgent.ToString();
        ClientIp clientIp = await GetOrCreateClientIp(ip, cancellationToken);
        ClientUserAgent clientUserAgent = await GetOrCreateClientUserAgent(userAgent, cancellationToken);
        return new ClientInfo(clientIp, clientUserAgent);
    }

    private async Task<ClientIp> GetOrCreateClientIp(string ip, CancellationToken cancellationToken)
    {
        ClientIp? clientIp = await db.ClientIps.FirstOrDefaultAsync(x => x.Ipaddress == ip, cancellationToken);
        if (clientIp == null)
        {
            clientIp = new ClientIp { Ipaddress = ip };
            db.ClientIps.Add(clientIp);
            await db.SaveChangesAsync(cancellationToken);
        }
        return clientIp;
    }

    private async Task<ClientUserAgent> GetOrCreateClientUserAgent(string userAgent, CancellationToken cancellationToken)
    {
        ClientUserAgent? clientUserAgent = await db.ClientUserAgents.FirstOrDefaultAsync(x => x.UserAgent == userAgent, cancellationToken);
        if (clientUserAgent == null)
        {
            clientUserAgent = new ClientUserAgent { UserAgent = userAgent };
            db.ClientUserAgents.Add(clientUserAgent);
            await db.SaveChangesAsync(cancellationToken);
        }
        return clientUserAgent;
    }
}

public record ClientInfo(ClientIp ClientIP, ClientUserAgent ClientUserAgent);
