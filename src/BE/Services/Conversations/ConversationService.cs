using Chats.BE.Services.Conversations.Dtos;
using OpenAI.Chat;

namespace Chats.BE.Services.Conversations;

public abstract class ConversationService
{
    public abstract IAsyncEnumerable<ConversationSegment> ChatStreamed(ChatMessage[] messages, CancellationToken cancellationToken);
}
