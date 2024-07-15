using Chats.BE.DB;
using Chats.BE.Services.Conversations.Dtos;

namespace Chats.BE.Services.Conversations;

public class ConversationFactory(ChatsDB db)
{
    public ConversationService CreateConversationService(Guid modelId, ModelConfig userModelConfig)
    {
        throw new NotImplementedException();
    }
}
