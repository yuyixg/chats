using Chats.BE.DB;
using Chats.BE.Services.Conversations.Implementations.Azure;
using Chats.BE.Services.Conversations.Implementations.DashScope;
using Chats.BE.Services.Conversations.Implementations.GLM;
using Chats.BE.Services.Conversations.Implementations.Hunyuan;
using Chats.BE.Services.Conversations.Implementations.Kimi;
using Chats.BE.Services.Conversations.Implementations.OpenAI;
using Chats.BE.Services.Conversations.Implementations.QianFan;

namespace Chats.BE.Services.Conversations;

public class ConversationFactory
{
    public ConversationService CreateConversationService(Model model)
    {
        KnownModelProvider modelProvider = (KnownModelProvider)model.ModelKey.ModelProviderId;
        ConversationService cs = modelProvider switch
        {
            KnownModelProvider.OpenAI => new OpenAIConversationService(model),
            KnownModelProvider.Azure => new AzureConversationService(model),
            KnownModelProvider.QianFan => new QianFanConversationService(model),
            KnownModelProvider.QianWen => new DashScopeConversationService(model),
            KnownModelProvider.ZhiPuAI => new GLMConversationService(model),
            KnownModelProvider.Moonshot => new KimiConversationService(model),
            KnownModelProvider.HunYuan => new HunyuanConversationService(model),
            _ => throw new ArgumentException("Invalid model type")
        };
        return cs;
    }
}
