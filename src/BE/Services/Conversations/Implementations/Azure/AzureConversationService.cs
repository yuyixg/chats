using Azure.AI.OpenAI;
using Chats.BE.DB;
using Chats.BE.Services.Conversations.Dtos;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.Conversations.Implementations.Azure;

public class AzureConversationService : ConversationService
{
    private ChatClient ChatClient { get; }

    public AzureConversationService(Model model) : base(model)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(model.ModelKey.Host, nameof(model.ModelKey.Host));
        ArgumentException.ThrowIfNullOrWhiteSpace(model.ModelKey.Secret, nameof(model.ModelKey.Secret));

        OpenAIClient api = new AzureOpenAIClient(new Uri(model.ModelKey.Host), new ApiKeyCredential(model.ModelKey.Secret));
        ChatClient = api.GetChatClient(model.DeploymentName);
    }

    public override async IAsyncEnumerable<ConversationSegment> ChatStreamedInternal(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        int inputTokenCount = GetPromptTokenCount(messages);
        int outputTokenCount = 0;
        // notify inputTokenCount first to better support price calculation
        yield return new ConversationSegment
        {
            TextSegment = "",
            InputTokenCount = inputTokenCount,
            OutputTokenCount = 0,
        };

        await foreach (StreamingChatCompletionUpdate delta in ChatClient.CompleteChatStreamingAsync(messages, options, cancellationToken))
        {
            if (delta.FinishReason == ChatFinishReason.Stop) yield break;
            if (delta.FinishReason == ChatFinishReason.Length) yield break;
            if (delta.ContentUpdate.Count == 0) continue;

            if (delta.Usage != null)
            {
                yield return new ConversationSegment
                {
                    TextSegment = delta.ContentUpdate[0].Text,
                    InputTokenCount = delta.Usage.InputTokenCount,
                    OutputTokenCount = delta.Usage.OutputTokenCount,
                };
            }
            else
            {
                outputTokenCount += Tokenizer.CountTokens(delta.ContentUpdate[0].Text);
                yield return new ConversationSegment
                {
                    TextSegment = delta.ContentUpdate[0].Text,
                    InputTokenCount = inputTokenCount,
                    OutputTokenCount = outputTokenCount,
                };
            }
        }
    }
}
