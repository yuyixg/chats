using AI.Dev.OpenAI.GPT;
using Azure;
using Azure.AI.OpenAI;
using Chats.BE.Services.Conversations.Dtos;
using OpenAI;
using OpenAI.Chat;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.Conversations.Implementations.Azure;

public class AzureConversationService : ConversationService
{
    public string SuggestedType { get; }
    private ChatClient ChatClient { get; }
    public JsonAzureModelConfig GlobalModelConfig { get; }

    public AzureConversationService(string keyConfigText, string suggestedType, string modelConfigText)
    {
        JsonAzureApiConfig keyConfig = JsonAzureApiConfig.Parse(keyConfigText);
        GlobalModelConfig = JsonAzureModelConfig.Parse(modelConfigText);
        OpenAIClient api = new AzureOpenAIClient(new Uri(keyConfig.Host), new AzureKeyCredential(keyConfig.ApiKey));
        SuggestedType = suggestedType;
        ChatClient = api.GetChatClient(GlobalModelConfig.DeploymentName);
    }

    public override async IAsyncEnumerable<ConversationSegment> ChatStreamed(ChatMessage[] messages, ModelConfig userModelConfig, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        ChatCompletionOptions chatCompletionOptions = new()
        {
            Temperature = userModelConfig.Temperature,
            MaxTokens = SuggestedType switch
            {
                "gpt-3.5-turbo" => null,
                "gpt-4" => null,
                "gpt-4-vision" => 4096,
                _ => 4096,
            }
        };

        int inputTokenCount = messages.Sum(x => x.Content.Where(x => x.Kind == ChatMessageContentPartKind.Text).Sum(x => GPT3Tokenizer.Encode(x.Text).Count));
        int outputTokenCount = 0;
        await foreach (StreamingChatCompletionUpdate delta in ChatClient.CompleteChatStreamingAsync(messages, chatCompletionOptions, cancellationToken))
        {
            // bug:
            // {"error":{"message":"The server had an error processing your request. Sorry about that! You can retry your request, or contact us through an Azure support request at: https://go.microsoft.com/fwlink/?linkid=2213926 if you keep seeing this error.","type":"server_error","param":null,"code":null}}
            if (delta.Id == null) yield break;

            if (delta.FinishReason == ChatFinishReason.Stop) yield break;

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
