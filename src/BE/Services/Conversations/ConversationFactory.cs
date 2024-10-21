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
            KnownModelProvider.OpenAI => new OpenAIConversationService(model.ModelKey),
            KnownModelProvider.Azure => new AzureConversationService(model.ModelKey),
            KnownModelProvider.QianFan => new QianFanConversationService(model.ModelKey),
            KnownModelProvider.QianWen => new DashScopeConversationService(model.ModelKey),
            KnownModelProvider.ZhiPuAI => new GLMConversationService(model.ModelKey),
            KnownModelProvider.Moonshot => new KimiConversationService(model.ModelKey),
            KnownModelProvider.HunYuan => new HunyuanConversationService(model.ModelKey),
            _ => throw new ArgumentException("Invalid model type")
        };
        return cs;
    }
}
