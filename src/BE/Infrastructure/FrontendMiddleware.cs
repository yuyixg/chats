using Microsoft.Extensions.FileProviders;
using System.Diagnostics.CodeAnalysis;

namespace Chats.BE.Infrastructure;

public class FrontendMiddleware(RequestDelegate next, IWebHostEnvironment webHostEnvironment)
{
    private readonly IFileProvider fileProvider = webHostEnvironment.WebRootFileProvider;

    public async Task Invoke(HttpContext context)
    {
        do
        {
            if (ShouldBypassProcessing(context))
            {
                break;
            }

            if (context.Request.Path.Value!.EndsWith('/'))
            {
                PathString suggestedPath = context.Request.Path + "index.html";
                if (fileProvider.GetFileInfo(suggestedPath).Exists)
                {
                    context.Request.Path = suggestedPath;
                    break;
                }
            }
            if (!Path.HasExtension(context.Request.Path))
            {
                int lastIndexOfSlash = context.Request.Path.Value.LastIndexOf('/');
                if (lastIndexOfSlash != -1)
                {
                    string prefixPart = context.Request.Path.Value[..lastIndexOfSlash];
                    string suggestedPath = prefixPart + ".html";
                    if (fileProvider.GetFileInfo(suggestedPath).Exists)
                    {
                        context.Request.Path = suggestedPath;
                        break;
                    }

                    string suggestedPath2 = prefixPart + "/[id].html";
                    if (fileProvider.GetFileInfo(suggestedPath2).Exists)
                    {
                        context.Request.Path = suggestedPath2;
                        break;
                    }
                }
                else
                {
                    string suggestedPath = context.Request.Path + ".html";
                    if (fileProvider.GetFileInfo(suggestedPath).Exists)
                    {
                        context.Request.Path = suggestedPath;
                        break;
                    }
                }
            }
        } while (false);

        await next(context);
    }

    private bool ShouldBypassProcessing(HttpContext context)
    {
        return context.Request.Path.Value == null ||
            context.Request.Path.StartsWithSegments("/api") ||
            context.Request.Path.StartsWithSegments("/swagger") ||
            context.Request.Path.StartsWithSegments("/v1") ||
            !IsGetOrHeadMethod(context.Request.Method) ||
            fileProvider.GetFileInfo(context.Request.Path).Exists;
    }

    private static bool IsGetOrHeadMethod(string method) => HttpMethods.IsGet(method) || HttpMethods.IsHead(method);
}
