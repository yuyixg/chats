using AI.Dev.OpenAI.GPT;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.Conversations.Implementations.Azure;
using OpenAI.Chat;
using OpenAI;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.ClientModel;
using Chats.BE.DB;

namespace Chats.BE.Services.Conversations.Implementations.OpenAI;

public class OpenAIConversationService : ConversationService
{
    private readonly OpenAIClient _api;

    public OpenAIConversationService(ModelKey2 modelKey)
    {
        _api = new(new ApiKeyCredential(modelKey.ApiKey), new OpenAIClientOptions()
        {
            Endpoint = !string.IsNullOrEmpty(modelKey.Host) ? new Uri(modelKey.Host) : null,
        });
    }

    public override async IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, CurrentUser currentUser, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        ChatClient ChatClient = _api.GetChatClient(options);

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
