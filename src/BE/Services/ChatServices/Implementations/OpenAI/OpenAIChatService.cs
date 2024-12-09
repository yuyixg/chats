using Chats.BE.Services.ChatServices.Dtos;
using OpenAI.Chat;
using OpenAI;
using System.Runtime.CompilerServices;
using System.ClientModel;
using Chats.BE.DB;

namespace Chats.BE.Services.ChatServices.Implementations.OpenAI;

public partial class OpenAIChatService : ChatService
{
    private readonly ChatClient _chatClient;

    public OpenAIChatService(Model model, Uri? enforcedApiHost = null) : base(model)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(model.ModelKey.Secret, nameof(model.ModelKey.Secret));

        OpenAIClient api = new(new ApiKeyCredential(model.ModelKey.Secret!), new OpenAIClientOptions()
        {
            Endpoint = enforcedApiHost ?? (!string.IsNullOrWhiteSpace(model.ModelKey.Host) ? new Uri(model.ModelKey.Host) : null),
        });
        _chatClient = api.GetChatClient(model.ApiModelId);
    }

    public OpenAIChatService(Model model, ChatClient chatClient) : base(model)
    {
        _chatClient = chatClient;
    }

    public override async IAsyncEnumerable<ChatSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await foreach (StreamingChatCompletionUpdate delta in _chatClient.CompleteChatStreamingAsync(messages, options, cancellationToken))
        {
            if (delta.ContentUpdate.Count == 0) continue;

            yield return new ChatSegment
            {
                TextSegment = delta.ContentUpdate[0].Text,
                FinishReason = delta.FinishReason,
                Usage = delta.Usage != null ? new Dtos.ChatTokenUsage()
                {
                    InputTokens = delta.Usage.InputTokenCount,
                    OutputTokens = delta.Usage.OutputTokenCount,
                    ReasoningTokens = delta.Usage.OutputTokenDetails?.ReasoningTokenCount ?? 0,
                } : null,
            };
        }
    }

    public override async Task<ChatSegment> Chat(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, CancellationToken cancellationToken)
    {
        ClientResult<ChatCompletion> cc = await _chatClient.CompleteChatAsync(messages, options, cancellationToken);
        ChatCompletion delta = cc.Value;
        return new ChatSegment
        {
            TextSegment = delta.Content[0].Text,
            FinishReason = delta.FinishReason,
            Usage = delta.Usage != null ? new Dtos.ChatTokenUsage()
            {
                InputTokens = delta.Usage.InputTokenCount,
                OutputTokens = delta.Usage.OutputTokenCount,
                ReasoningTokens = delta.Usage.OutputTokenDetails?.ReasoningTokenCount ?? 0,
            } : null,
        };
    }
}
