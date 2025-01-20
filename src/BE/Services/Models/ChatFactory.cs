using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Services.Models.ChatServices.DashScope;
using Chats.BE.Services.Models.ChatServices.Hunyuan;
using Chats.BE.Services.Models.ChatServices.OpenAI;
using Chats.BE.Services.Models.ChatServices.QianFan;
using Chats.BE.Services.Models.ChatServices.Test;
using OpenAI.Chat;

namespace Chats.BE.Services.Models;

public class ChatFactory(ILogger<ChatFactory> logger)
{
    public ChatService CreateConversationService(Model model)
    {
        DBModelProvider modelProvider = (DBModelProvider)model.ModelKey.ModelProviderId;
        ChatService cs = modelProvider switch
        {
            DBModelProvider.Test => new TestChatService(model),
            DBModelProvider.OpenAI => new OpenAIChatService(model),
            DBModelProvider.AzureOpenAI => new AzureChatService(model),
            DBModelProvider.WenXinQianFan => new QianFanChatService(model),
            DBModelProvider.AliyunDashscope => new DashScopeChatService(model),
            DBModelProvider.ZhiPuAI => new GLMChatService(model),
            DBModelProvider.Moonshot => new KimiChatService(model),
            DBModelProvider.HunYuan => new HunyuanChatService(model),
            DBModelProvider.Sparkdesk => new SparkDeskChatService(model),
            DBModelProvider.LingYi => new LingYiChatService(model),
            DBModelProvider.DeepSeek => new DeepSeekChatService(model),
            DBModelProvider.xAI => new XAIChatService(model),
            DBModelProvider.GithubModels => new GithubModelsChatService(model),
            DBModelProvider.GoogleAI => new GoogleAIChatService(model),
            _ => throw new NotSupportedException($"Unknown model provider: {modelProvider}")
        };
        return cs;
    }

    public async Task<ModelValidateResult> ValidateModel(ModelKey modelKey, ModelReference modelReference, string? deploymentName, CancellationToken cancellationToken)
    {
        using ChatService cs = CreateConversationService(new Model
        {
            ModelKey = modelKey, 
            ModelReference = modelReference,
            DeploymentName = deploymentName
        });
        try
        {
            await foreach (var seg in cs.ChatStreamedFEProcessed([new UserChatMessage("1+1=?")], new ChatCompletionOptions(), ChatExtraDetails.Default, cancellationToken))
            {
                if (seg.IsFromUpstream)
                {
                    return ModelValidateResult.Success();
                }
            }
            return ModelValidateResult.Success();
        }
        catch (Exception e)
        {
            logger.LogInformation(e, "TestModel failed");
            return ModelValidateResult.Fail(e.Message);
        }
    }
}
