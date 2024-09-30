using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.Conversations.Implementations.Azure;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.Text.Json;
using AI.Dev.OpenAI.GPT;
using System.Runtime.CompilerServices;
using Chats.BE.DB.Jsons;

namespace Chats.BE.Services.Conversations.Implementations.GLM;

public class GLMConversationService : ConversationService
{
    /// <summary>
    /// possible values:
    /// <list type="bullet">
    /// <item>glm-4</item>
    /// <item>glm-4v</item>
    /// </list>
    /// </summary>
    private string SuggestedType { get; }
    private ChatClient ChatClient { get; }
    private JsonGLMModelConfig GlobalModelConfig { get; }
    private bool IsVision => SuggestedType == "glm-4v";

    public GLMConversationService(string keyConfigText, string suggestedType, string modelConfigText)
    {
        JsonAzureApiConfig keyConfig = JsonAzureApiConfig.Parse(keyConfigText);
        GlobalModelConfig = JsonSerializer.Deserialize<JsonGLMModelConfig>(modelConfigText)!;
        OpenAIClient api = new(new ApiKeyCredential(keyConfig.ApiKey), new OpenAIClientOptions()
        {
            Endpoint = new Uri("https://open.bigmodel.cn/api/paas/v4/")
        });
        SuggestedType = suggestedType;
        ChatClient = api.GetChatClient(GlobalModelConfig.Model);
    }

    public override async IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, JsonUserModelConfig config, CurrentUser currentUser, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (!IsVision)
        {
            messages = messages.Select(RemoveImages).ToList();
        }

        ChatCompletionOptions chatCompletionOptions = new()
        {
            Temperature = config.Temperature,
            MaxOutputTokenCount = config.MaxLength,
            EndUserId = currentUser.Id.ToString(),
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
            if (delta.FinishReason != ChatFinishReason.Stop)
            {
                outputTokenCount += GPT3Tokenizer.Encode(delta.ContentUpdate[0].Text).Count;
                yield return new ConversationSegment
                {
                    TextSegment = delta.ContentUpdate[0].Text,
                    InputTokenCount = inputTokenCount,
                    OutputTokenCount = outputTokenCount,
                };
            }
            else
            {
                yield return new ConversationSegment
                {
                    TextSegment = "",
                    InputTokenCount = delta.Usage.InputTokenCount,
                    OutputTokenCount = delta.Usage.OutputTokenCount,
                };
            }
        }
    }

    private static ChatMessage RemoveImages(ChatMessage message)
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
