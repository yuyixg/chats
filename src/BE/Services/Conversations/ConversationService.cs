using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations.Dtos;
using OpenAI.Chat;
using System.Runtime.CompilerServices;
using System.Text;

namespace Chats.BE.Services.Conversations;

public abstract class ConversationService : IDisposable
{
    public abstract IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, JsonUserModelConfig config, CurrentUser currentUser, CancellationToken cancellationToken);

    internal virtual async IAsyncEnumerable<ConversationSegment> ChatNonStreamed(IReadOnlyList<ChatMessage> messages, JsonUserModelConfig config, CurrentUser currentUser, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        StringBuilder result = new();
        ConversationSegment? lastSegment = null;
        await foreach (ConversationSegment seg in ChatStreamed(messages, config, currentUser, cancellationToken))
        {
            lastSegment = seg;
            result.Append(seg.TextSegment);
        }

        yield return new ConversationSegment()
        {
            InputTokenCount = lastSegment?.InputTokenCount ?? 0, 
            OutputTokenCount = lastSegment?.OutputTokenCount ?? 0,
            TextSegment = result.ToString(),
        };
    }

    public void Dispose()
    {
        Disposing();
        GC.SuppressFinalize(this);
    }

    protected virtual void Disposing() { }
}
