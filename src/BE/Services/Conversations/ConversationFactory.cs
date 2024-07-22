using Chats.BE.DB;
using Chats.BE.Services.Conversations.Implementations.Azure;
using Chats.BE.Services.Conversations.Implementations.DashScope;

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
            KnownModelProvider.QianFan => throw new NotImplementedException(),
            KnownModelProvider.QianWen => new DashScopeConversationService(cm.KeyConfigText, cm.SuggestedType, cm.ModelConfigText),
            KnownModelProvider.ZhiPuAI => throw new NotImplementedException(),
            KnownModelProvider.Moonshot => throw new NotImplementedException(),
            KnownModelProvider.HunYuan => throw new NotImplementedException(),
            _ => throw new ArgumentException("Invalid model type")
        };
        return cs;
    }
}
