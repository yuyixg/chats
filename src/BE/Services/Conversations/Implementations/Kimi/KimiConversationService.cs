using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.Conversations.Implementations.Azure;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.Text.Json;
using AI.Dev.OpenAI.GPT;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.Conversations.Implementations.Kimi;

public class KimiConversationService : ConversationService
{
    /// <summary>
    /// possible values:
    /// <list type="bullet">
    /// <item>moonshot-v1-8k</item>
    /// <item>moonshot-v1-32k</item>
    /// <item>moonshot-v1-128k</item>
    /// </list>
    /// </summary>
    private string SuggestedType { get; }
    private ChatClient ChatClient { get; }
    private JsonKimiModelConfig GlobalModelConfig { get; }

    public KimiConversationService(string keyConfigText, string suggestedType, string modelConfigText)
    {
        JsonAzureApiConfig keyConfig = JsonAzureApiConfig.Parse(keyConfigText);
        GlobalModelConfig = JsonSerializer.Deserialize<JsonKimiModelConfig>(modelConfigText)!;
        OpenAIClient api = new(new ApiKeyCredential(keyConfig.ApiKey), new OpenAIClientOptions()
        {
            Endpoint = new Uri("https://api.moonshot.cn/v1")
        });
        SuggestedType = suggestedType;
        ChatClient = api.GetChatClient(SuggestedType);
    }

    public override async IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, ModelConfig config, CurrentUser currentUser, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        messages = messages.Select(RemoveImages).ToList();

        ChatCompletionOptions chatCompletionOptions = new()
        {
            Temperature = config.Temperature,
            MaxTokens = config.MaxLength,
            User = currentUser.Id.ToString(),
        };

        int inputTokenCount = messages.Sum(GetTokenCount);
        int outputTokenCount = 0;
        // notify inputTokenCount first to better support price calculation
        yield return new ConversationSegment
        {
            TextSegment = "",
            InputTokenCount = inputTokenCount,
            OutputTokenCount = 0,
        };

        await foreach (StreamingChatCompletionUpdate delta in ChatClient.CompleteChatStreamingAsync(messages, chatCompletionOptions, cancellationToken))
        {
            if (delta.FinishReason == ChatFinishReason.Stop) yield break;

            // Kimi response not exactly follows OpenAI response protocol
            // it should be(usage is in root level):
            // data: {"choices":[],"object":"chat.completion.chunk","usage":{"prompt_tokens":24,"completion_tokens":40,"total_tokens":64},"created":1721632962,"system_fingerprint":null,"model":"qwen-max","id":"chatcmpl-bb0f55ef-dd53-9e1a-ab41-b72063d1b4a3"}
            // but it is(usage is inside of choices property, which is wrong):
            // data: {"id":"cmpl-c9c0ccc44dbe4a66b8cb4d350113f389","object":"chat.completion.chunk","created":1721632716,"model":"moonshot-v1-8k","choices":[{"index":0,"delta":{},"finish_reason":"stop","usage":{"prompt_tokens":24,"completion_tokens":46,"total_tokens":70}}]}
            // so we can't use OpenAI SDK's response to calculate token count
            // token is calculated by GPT3Tokenizer, which is not correct currently
            // if kimi fix this, we can use OpenAI SDK's response to calculate token count
            outputTokenCount += GPT3Tokenizer.Encode(delta.ContentUpdate[0].Text).Count;
            yield return new ConversationSegment
            {
                TextSegment = delta.ContentUpdate[0].Text,
                InputTokenCount = inputTokenCount,
                OutputTokenCount = outputTokenCount,
            };
        }
    }

    private static ChatMessage RemoveImages(ChatMessage message)
    {
        return message switch
        {
            UserChatMessage userChatMessage => new UserChatMessage(userChatMessage.Content.Select(c => c.Kind switch
            {
                var x when x == ChatMessageContentPartKind.Image => ChatMessageContentPart.CreateTextMessageContentPart(c.ImageUri.ToString()),
                _ => c,
            })),
            _ => message,
        };
    }

    static int GetTokenCount(ChatMessage chatMessage)
    {
        return chatMessage.Content.Sum(GetTokenCountForPart);
    }

    static int GetTokenCountForPart(ChatMessageContentPart part)
    {
        return part.Kind switch
        {
            var x when x == ChatMessageContentPartKind.Text => GPT3Tokenizer.Encode(part.Text).Count,
            // kimi should not allow image input
            var x when x == ChatMessageContentPartKind.Image => 0,
            _ => 0,
        };
    }
}
