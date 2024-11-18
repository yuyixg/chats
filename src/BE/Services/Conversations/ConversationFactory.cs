using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Services.Conversations.Implementations.Azure;
using Chats.BE.Services.Conversations.Implementations.DashScope;
using Chats.BE.Services.Conversations.Implementations.GLM;
using Chats.BE.Services.Conversations.Implementations.Hunyuan;
using Chats.BE.Services.Conversations.Implementations.Kimi;
using Chats.BE.Services.Conversations.Implementations.OpenAI;
using Chats.BE.Services.Conversations.Implementations.QianFan;
using Chats.BE.Services.Conversations.Implementations.Test;

namespace Chats.BE.Services.Conversations;

public class ConversationFactory
{
    public ConversationService CreateConversationService(Model model)
    {
        DBModelProvider modelProvider = (DBModelProvider)model.ModelKey.ModelProviderId;
        ConversationService cs = modelProvider switch
        {
            DBModelProvider.Test => new TestConversationService(model),
            DBModelProvider.OpenAI => new OpenAIConversationService(model),
            DBModelProvider.Azure => new AzureConversationService(model),
            DBModelProvider.QianFan => new QianFanConversationService(model),
            DBModelProvider.QianWen => new DashScopeConversationService(model),
            DBModelProvider.ZhiPuAI => new GLMConversationService(model),
            DBModelProvider.Moonshot => new KimiConversationService(model),
            DBModelProvider.HunYuan => new HunyuanConversationService(model),
            DBModelProvider.Spark => throw new NotImplementedException("Spark model is not implemented"),
            DBModelProvider.LingYi => throw new NotImplementedException("LingYi model is not implemented"),
            _ => throw new NotSupportedException($"Unknown model provider: {modelProvider}")
        };
        return cs;
    }
}
