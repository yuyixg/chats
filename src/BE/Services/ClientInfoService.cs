using Chats.BE.DB;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services;

public class ClientInfoService(IHttpContextAccessor httpContextAccessor, ChatsDB db)
{
    private HttpContext HttpContext => httpContextAccessor.HttpContext ?? throw new InvalidOperationException("HttpContext is not available.");

    public string ClientIP
    {
        get
        {
            HttpContext context = HttpContext;
            return context!.Request.Headers["X-Forwarded-For"].FirstOrDefault() ??
                   context!.Connection.RemoteIpAddress!.ToString();
        }
    }

    public string UserAgent => HttpContext.Request.Headers.UserAgent.ToString();

    public async Task<ClientIp> GetDBClientIP(CancellationToken cancellationToken)
    {
        string ip = ClientIP;
        ClientIp? clientIp = await db.ClientIps.FirstOrDefaultAsync(x => x.Ipaddress == ip, cancellationToken);
        if (clientIp == null)
        {
            clientIp = new ClientIp { Ipaddress = ip };
            db.ClientIps.Add(clientIp);
            await db.SaveChangesAsync(cancellationToken);
        }
        return clientIp;
    }

    public async Task<ClientUserAgent> GetDBUserAgent(CancellationToken cancellationToken)
    {
        string userAgent = UserAgent;
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
