using Chats.BE.DB;
using Chats.BE.Services.Conversations.Implementations.Azure;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.Conversations;

public class ConversationFactory(ChatsDB db)
{
    public async Task<ConversationService> CreateConversationService(Guid modelId, CancellationToken cancellationToken)
    {
        var cm = await db.ChatModels
            .Include(x => x.ModelKeys)
            .Where(x => x.Id == modelId && x.Enabled)
            .Select(x => new
            {
                Provider = x.ModelKeys.Type,
                KeyConfigText = x.ModelKeys.Configs,
                ModelConfigText = x.ModelConfig,
                SuggestedType = x.ModelVersion,
            })
            .SingleOrDefaultAsync(cancellationToken) ?? throw new ArgumentException("Model not found or not enabled");

        KnownModelProvider knownModelProvider = Enum.Parse<KnownModelProvider>(cm.Provider);
        return knownModelProvider switch
        {
            KnownModelProvider.OpenAI => throw new NotImplementedException(),
            KnownModelProvider.Azure => new AzureConversationService(cm.KeyConfigText, cm.SuggestedType, cm.ModelConfigText),
            KnownModelProvider.QianFan => throw new NotImplementedException(),
            KnownModelProvider.QianWen => throw new NotImplementedException(),
            KnownModelProvider.ZhiPuAI => throw new NotImplementedException(),
            KnownModelProvider.Moonshot => throw new NotImplementedException(),
            KnownModelProvider.HunYuan => throw new NotImplementedException(),
            _ => throw new ArgumentException("Invalid model type")
        };
    }
}
