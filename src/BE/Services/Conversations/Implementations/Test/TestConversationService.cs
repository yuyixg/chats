using Chats.BE.DB;
using Chats.BE.Services.Conversations.Dtos;
using OpenAI.Chat;
using System.Runtime.CompilerServices;
using System.Text;

namespace Chats.BE.Services.Conversations.Implementations.Test;

public class TestConversationService(Model model) : ConversationService(model)
{
    public override async IAsyncEnumerable<ChatSegment> ChatStreamed(
        IReadOnlyList<ChatMessage> messages, 
        ChatCompletionOptions options, 
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        int inputTokens = GetPromptTokenCount(messages);
        string outputTemplate = $$"""
            Test success!
            inputTokens: {{inputTokens}}, outputTokens: ~{outputTokens}
            """;
        string output = outputTemplate.Replace("{outputTokens}", (Tokenizer.CountTokens(outputTemplate) - 3).ToString());
        StringBuilder outputed = new(output.Length);
        foreach (char c in output)
        {
            outputed.Append(c);
            int outputTokens = Tokenizer.CountTokens(outputed.ToString());
            yield return new ChatSegment()
            {
                TextSegment = c.ToString(),
                Usage = new Dtos.ChatTokenUsage()
                {
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                },
                FinishReason = null,
            };
            await Task.Delay(1, cancellationToken);
        }
    }
}
