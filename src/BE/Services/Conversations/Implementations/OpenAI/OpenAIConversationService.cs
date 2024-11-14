using Chats.BE.Services.Conversations.Dtos;
using OpenAI.Chat;
using OpenAI;
using System.Runtime.CompilerServices;
using System.ClientModel;
using Chats.BE.DB;

namespace Chats.BE.Services.Conversations.Implementations.OpenAI;

public class OpenAIConversationService : ConversationService
{
    private readonly ChatClient _chatClient;

    public OpenAIConversationService(Model model, Uri? enforcedApiHost = null) : base(model)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(model.ModelKey.Secret, nameof(model.ModelKey.Secret));

        OpenAIClient api = new(new ApiKeyCredential(model.ModelKey.Secret!), new OpenAIClientOptions()
        {
            Endpoint = enforcedApiHost ?? (!string.IsNullOrWhiteSpace(model.ModelKey.Host) ? new Uri(model.ModelKey.Host) : null),
        });
        _chatClient = api.GetChatClient(model.ApiModelId);
    }

    public OpenAIConversationService(Model model, ChatClient chatClient) : base(model)
    {
        _chatClient = chatClient;
    }

    public override async IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        int inputTokenCount = GetPromptTokenCount(messages);
        int outputTokenCount = 0;
        // notify inputTokenCount first to better support price calculation
        yield return new ConversationSegment
        {
            TextSegment = "",
            InputTokenCountAccumulated = inputTokenCount,
            OutputTokenCountAccumulated = 0,
        };

        await foreach (StreamingChatCompletionUpdate delta in _chatClient.CompleteChatStreamingAsync(messages, options, cancellationToken))
        {
            if (delta.FinishReason == ChatFinishReason.Stop) yield break;
            if (delta.FinishReason == ChatFinishReason.Length) yield break;
            if (delta.ContentUpdate.Count == 0) continue;

            if (delta.Usage != null)
            {
                yield return new ConversationSegment
                {
                    TextSegment = delta.ContentUpdate[0].Text,
                    InputTokenCountAccumulated = delta.Usage.InputTokenCount,
                    OutputTokenCountAccumulated = delta.Usage.OutputTokenCount,
                };
            }
            else
            {
                outputTokenCount += Tokenizer.CountTokens(delta.ContentUpdate[0].Text);
                yield return new ConversationSegment
                {
                    TextSegment = delta.ContentUpdate[0].Text,
                    InputTokenCountAccumulated = inputTokenCount,
                    OutputTokenCountAccumulated = outputTokenCount,
                };
            }
        }
    }

    public override async Task<ConversationSegment> Chat(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, CancellationToken cancellationToken)
    {
        ClientResult<ChatCompletion> cc = await _chatClient.CompleteChatAsync(messages, options, cancellationToken);
        return new ConversationSegment
        {
            TextSegment = cc.Value.Content[0].Text,
            InputTokenCountAccumulated = cc.Value.Usage.InputTokenCount, // token is reliable for non streamed completion
            OutputTokenCountAccumulated = cc.Value.Usage.OutputTokenCount, // token is reliable for non streamed completion
        };
    }
}
