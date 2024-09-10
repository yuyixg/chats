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
    public ConversationService CreateConversationService(KnownModelProvider modelProvider, string jsonKeyConfig, string jsonModelConfig, string suggestedType)
    {
        ConversationService cs = modelProvider switch
        {
            KnownModelProvider.OpenAI => new OpenAIConversationService(jsonKeyConfig, suggestedType, jsonModelConfig),
            KnownModelProvider.Azure => new AzureConversationService(jsonKeyConfig, suggestedType, jsonModelConfig),
            KnownModelProvider.QianFan => new QianFanConversationService(jsonKeyConfig, jsonModelConfig),
            KnownModelProvider.QianWen => new DashScopeConversationService(jsonKeyConfig, suggestedType, jsonModelConfig),
            KnownModelProvider.ZhiPuAI => new GLMConversationService(jsonKeyConfig, suggestedType, jsonModelConfig),
            KnownModelProvider.Moonshot => new KimiConversationService(jsonKeyConfig, suggestedType, jsonModelConfig),
            KnownModelProvider.HunYuan => new HunyuanConversationService(jsonKeyConfig, suggestedType, jsonModelConfig),
            _ => throw new ArgumentException("Invalid model type")
        };
        return cs;
    }
}
