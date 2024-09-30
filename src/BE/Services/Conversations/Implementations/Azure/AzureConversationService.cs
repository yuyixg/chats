using AI.Dev.OpenAI.GPT;
using Azure;
using Azure.AI.OpenAI;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations.Dtos;
using OpenAI;
using OpenAI.Chat;
using System.Runtime.CompilerServices;
using System.Text.Json;

namespace Chats.BE.Services.Conversations.Implementations.Azure;

public class AzureConversationService : ConversationService
{
    /// <summary>
    /// possible values:
    /// <list type="bullet">
    /// <item>gpt-3.5-turbo</item>
    /// <item>gpt-4</item>
    /// <item>gpt-4-vision</item>
    /// </list>
    /// </summary>
    private string SuggestedType { get; }
    private ChatClient ChatClient { get; }
    private JsonAzureModelConfig GlobalModelConfig { get; }

    private bool IsVision => SuggestedType == "gpt-4-vision";

    public AzureConversationService(string keyConfigText, string suggestedType, string modelConfigText)
    {
        JsonAzureApiConfig keyConfig = JsonAzureApiConfig.Parse(keyConfigText);
        GlobalModelConfig = JsonSerializer.Deserialize<JsonAzureModelConfig>(modelConfigText)!;
        OpenAIClient api = new AzureOpenAIClient(new Uri(keyConfig.Host), new AzureKeyCredential(keyConfig.ApiKey));
        SuggestedType = suggestedType;
        ChatClient = api.GetChatClient(GlobalModelConfig.DeploymentName);
    }

    public override async IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, JsonUserModelConfig userModelConfig, CurrentUser currentUser, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        ChatCompletionOptions chatCompletionOptions = new()
        {
            Temperature = userModelConfig.Temperature,
            MaxOutputTokenCount = userModelConfig.MaxLength ?? SuggestedType switch
            {
                "gpt-3.5-turbo" => null,
                "gpt-4" => null,
                "gpt-4-vision" => 4096,
                _ => 4096,
            },
            EndUserId = currentUser.Id.ToString(),
        };

        if (!IsVision)
        {
            messages = messages.Select(RemoveImages).ToList();
        }

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
            // bug:
            // {"error":{"message":"The server had an error processing your request. Sorry about that! You can retry your request, or contact us through an Azure support request at: https://go.microsoft.com/fwlink/?linkid=2213926 if you keep seeing this error.","type":"server_error","param":null,"code":null}}
            if (delta.Id == null) yield break;

            if (delta.FinishReason == ChatFinishReason.Stop) yield break;
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
                outputTokenCount += GPT3Tokenizer.Encode(delta.ContentUpdate[0].Text).Count;
                yield return new ConversationSegment
                {
                    TextSegment = delta.ContentUpdate[0].Text,
                    InputTokenCount = inputTokenCount,
                    OutputTokenCount = outputTokenCount,
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
            // https://platform.openai.com/docs/guides/vision/calculating-costs
            // assume image is ~2048x4096 in detail: high, mosts 1105 tokens
            var x when x == ChatMessageContentPartKind.Image => 1105,
            _ => 0,
        };
    }
}
