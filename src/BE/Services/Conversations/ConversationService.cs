using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations.Dtos;
using OpenAI.Chat;

namespace Chats.BE.Services.Conversations;

public abstract class ConversationService : IDisposable
{
    public abstract IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, JsonUserModelConfig config, CurrentUser currentUser, CancellationToken cancellationToken);

    public void Dispose()
    {
        Disposing();
        GC.SuppressFinalize(this);
    }

    protected virtual void Disposing() { }
}
