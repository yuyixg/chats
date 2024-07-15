using Chats.BE.Services.Conversations.Dtos;
using OpenAI.Chat;

namespace Chats.BE.Services.Conversations.Implementations.Azure;

public class AzureConversationService : ConversationService
{
    public override IAsyncEnumerable<ConversationSegment> ChatStreamed(ChatMessage[] messages, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
