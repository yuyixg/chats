using Chats.BE.DB;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.Conversations.Extensions;
using Microsoft.ML.Tokenizers;
using OpenAI.Chat;
using System.Runtime.CompilerServices;
using System.Text;

namespace Chats.BE.Services.Conversations;

public abstract class ConversationService : IDisposable
{
    protected Model Model { get; }
    protected Tokenizer Tokenizer { get; }

    public ConversationService(Model model)
    {
        Model = model;
        try
        {
            Tokenizer = TiktokenTokenizer.CreateForModel(Model.ModelReference.Name);
        }
        catch (NotSupportedException)
        {
            Tokenizer = TiktokenTokenizer.CreateForEncoding("cl100k_base");
        }
    }

    public IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, CancellationToken cancellationToken)
    {
        ChatMessage[] filteredMessage = messages.Select(m => PreProcessMessage(Model, m)).ToArray();
        if (Model.ModelReference.AllowVision)
        {
            options.MaxOutputTokenCount ??= Model.ModelReference.MaxResponseTokens;
        }
        if (!Model.ModelReference.AllowSearch)
        {
            options.RemoveAllowSearch();
        }
        return ChatStreamedInternal(filteredMessage, options, cancellationToken);
    }

    public abstract IAsyncEnumerable<ConversationSegment> ChatStreamedInternal(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, CancellationToken cancellationToken);

    internal virtual async IAsyncEnumerable<ConversationSegment> ChatNonStreamed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        StringBuilder result = new();
        ConversationSegment? lastSegment = null;
        await foreach (ConversationSegment seg in ChatStreamed(messages, options, cancellationToken))
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

    protected static ChatMessage PreProcessMessage(Model model, ChatMessage message)
    {
        if (!model.ModelReference.AllowVision)
        {
            return ReplaceUserMessageImageIntoLinkText(message);
        }
        else
        {
            return message;
        }

        static ChatMessage ReplaceUserMessageImageIntoLinkText(ChatMessage message)
        {
            return message switch
            {
                UserChatMessage userChatMessage => new UserChatMessage(userChatMessage.Content.Select(c => c.Kind switch
                {
                    var x when x == ChatMessageContentPartKind.Image => ChatMessageContentPart.CreateTextPart(c.ImageUri.ToString()),
                    _ => c,
                })),
                _ => message,
            };
        }
    }

    protected int GetPromptTokenCount(IReadOnlyList<ChatMessage> messages)
    {
        const int TokenPerConversation = 3;
        int messageTokens = messages.Sum(m => m.CountTokens(Tokenizer));
        return TokenPerConversation + messageTokens;
    }

    public void Dispose()
    {
        Disposing();
        GC.SuppressFinalize(this);
    }

    protected virtual void Disposing() { }
}
