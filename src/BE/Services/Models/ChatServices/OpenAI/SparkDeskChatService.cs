using Chats.BE.DB;
using OpenAI.Chat;

namespace Chats.BE.Services.Models.ChatServices.OpenAI;

public class SparkDeskChatService(Model model) : OpenAIChatService(model, new Uri("https://spark-api-open.xf-yun.com/v1"))
{
    protected override async Task<ChatMessage[]> FEPreprocess(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, ChatExtraDetails feOptions, CancellationToken cancellationToken)
    {
        ChatMessage[] toReturn = await base.FEPreprocess(messages, options, feOptions, cancellationToken);
        // spark desk enable search is set via tool https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html#_3-%E8%AF%B7%E6%B1%82%E8%AF%B4%E6%98%8E
        // however unfortunately the tool is not available in OpenAI SDK
        // otherwise, the code should be: 
        // bool enableSearch = options.IsSearchEnabled();
        // options.Tools.Add(MakeSparkDeskSearchTool(enableSearch));
        return toReturn;
    }
}