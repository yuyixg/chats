using Chats.BE.DB;
using Chats.BE.Services.ChatServices.Dtos;
using Tokenizer = Microsoft.ML.Tokenizers.Tokenizer;
using OpenAI.Chat;
using System.Text;
using Microsoft.ML.Tokenizers;
using Chats.BE.Services.ChatServices.Extensions;

namespace Chats.BE.Services.ChatServices;

public abstract partial class ChatService : IDisposable
{
    public const float DefaultTemperature = 0.5f;
    public const string DefaultPrompt = "你是{{MODEL_NAME}}，请仔细遵循用户指令并认真回复，当前日期: {{CURRENT_DATE}}";

    internal protected Model Model { get; }
    internal protected Tokenizer Tokenizer { get; }

    public ChatService(Model model)
    {
        Model = model;
        try
        {
            if (model.ModelReference.Tokenizer is not null)
            {
                Tokenizer = TiktokenTokenizer.CreateForEncoding(model.ModelReference.Tokenizer.Name);
            }
            else
            {
                Tokenizer = TiktokenTokenizer.CreateForModel(Model.ModelReference.Name);
            }
        }
        catch (NotSupportedException)
        {
            Tokenizer = TiktokenTokenizer.CreateForEncoding("cl100k_base");
        }
    }

    public abstract IAsyncEnumerable<ChatSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, CancellationToken cancellationToken);

    public virtual async Task<ChatSegment> Chat(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, CancellationToken cancellationToken)
    {
        StringBuilder result = new();
        ChatSegment? lastSegment = null;
        await foreach (ChatSegment seg in ChatStreamed(messages, options, cancellationToken))
        {
            lastSegment = seg;
            result.Append(seg.TextSegment);
        }

        return new ChatSegment()
        {
            Usage = lastSegment?.Usage,
            FinishReason = lastSegment?.FinishReason,
            TextSegment = result.ToString(),
        };
    }

    internal protected int GetPromptTokenCount(IReadOnlyList<ChatMessage> messages)
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
