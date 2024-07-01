using Yarp.ReverseProxy.Configuration;

namespace Chats.BE.Infrastructure;

internal static class ReverseProxy
{
    public static void AddReverseProxy(this WebApplicationBuilder builder)
    {
        // Get the proxy destination address from environment variable
        string? proxyDestinationAddress = builder.Configuration["OLD_BE_URL"];
        if (string.IsNullOrEmpty(proxyDestinationAddress))
        {
            throw new InvalidOperationException("Environment variable 'OLD_BE_URL' not set.");
        }

        // Configure reverse proxy directly in code
        IReverseProxyBuilder proxyBuilder = builder.Services.AddReverseProxy();
        proxyBuilder.LoadFromMemory(
        [
            new RouteConfig
            {
                RouteId = "proxyRoute",
                ClusterId = "proxyCluster",
                Match = new RouteMatch
                {
                    Path = "/api/{**catch-all}",
                }
            }
        ],
        [
            new ClusterConfig
            {
                ClusterId = "proxyCluster",
                Destinations = new Dictionary<string, DestinationConfig>
                {
                    { "destination1", new DestinationConfig { Address = proxyDestinationAddress } }
                }
            }
        ]);
    }
}
