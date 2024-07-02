using Chats.BE.Services;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Common;

public class OldBEActionResult : IActionResult
{
    public async Task ExecuteResultAsync(ActionContext context)
    {
        // 获取老的API URL
        AppConfigService appConfigService = context.HttpContext.RequestServices.GetRequiredService<AppConfigService>();
        string oldBeUrl = appConfigService.OldBEUrl;

        // 获取 HttpClient
        IHttpClientFactory httpClientFactory = context.HttpContext.RequestServices.GetRequiredService<IHttpClientFactory>();
        using HttpClient httpClient = httpClientFactory.CreateClient();

        // 构建请求
        HttpRequest request = context.HttpContext.Request;
        HttpRequestMessage requestMessage = new()
        {
            Method = new HttpMethod(request.Method),
            RequestUri = new Uri($"{oldBeUrl}{request.Path}{request.QueryString}"),
            Content = new StreamContent(request.Body)
        };

        // Copy request headers
        foreach (KeyValuePair<string, Microsoft.Extensions.Primitives.StringValues> header in request.Headers)
        {
            requestMessage.Headers.TryAddWithoutValidation(header.Key, [.. header.Value]);
        }

        // 发送请求到老的API
        HttpResponseMessage responseMessage = await httpClient.SendAsync(requestMessage);

        // 回传响应
        HttpResponse response = context.HttpContext.Response;
        response.StatusCode = (int)responseMessage.StatusCode;

        foreach (KeyValuePair<string, IEnumerable<string>> header in responseMessage.Headers)
        {
            response.Headers[header.Key] = string.Join(",", header.Value);
        }

        // 如果存在内容响应头，也需要复制
        if (responseMessage.Content != null)
        {
            foreach (KeyValuePair<string, IEnumerable<string>> header in responseMessage.Content.Headers)
            {
                response.Headers[header.Key] = string.Join(",", header.Value);
            }

            await responseMessage.Content.CopyToAsync(response.Body);
        }
    }
}
