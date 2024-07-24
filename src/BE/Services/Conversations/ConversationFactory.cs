using Chats.BE.DB;
using Chats.BE.Services.Conversations.Implementations.Azure;
using Chats.BE.Services.Conversations.Implementations.DashScope;
using Chats.BE.Services.Conversations.Implementations.GLM;
using Chats.BE.Services.Conversations.Implementations.Kimi;
using Chats.BE.Services.Conversations.Implementations.QianFan;

namespace Chats.BE.Services.Conversations;

public class ConversationFactory
{
    public ConversationService CreateConversationService(ChatModel chatModel)
    {
        var cm = new
        {
            Provider = chatModel.ModelKeys.Type,
            KeyConfigText = chatModel.ModelKeys.Configs,
            ModelConfigText = chatModel.ModelConfig,
            SuggestedType = chatModel.ModelVersion,
        };

        KnownModelProvider knownModelProvider = Enum.Parse<KnownModelProvider>(cm.Provider);
        ConversationService cs = knownModelProvider switch
        {
            KnownModelProvider.OpenAI => throw new NotImplementedException(),
            KnownModelProvider.Azure => new AzureConversationService(cm.KeyConfigText, cm.SuggestedType, cm.ModelConfigText),
            KnownModelProvider.QianFan => new QianFanConversationService(cm.KeyConfigText, cm.ModelConfigText),
            KnownModelProvider.QianWen => new DashScopeConversationService(cm.KeyConfigText, cm.SuggestedType, cm.ModelConfigText),
            KnownModelProvider.ZhiPuAI => new GLMConversationService(cm.KeyConfigText, cm.SuggestedType, cm.ModelConfigText),
            KnownModelProvider.Moonshot => new KimiConversationService(cm.KeyConfigText, cm.SuggestedType, cm.ModelConfigText),
            KnownModelProvider.HunYuan => throw new NotImplementedException(),
            _ => throw new ArgumentException("Invalid model type")
        };
        return cs;
    }
}
