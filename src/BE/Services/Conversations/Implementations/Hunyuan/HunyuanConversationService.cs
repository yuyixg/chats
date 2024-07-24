using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations.Dtos;
using OpenAI.Chat;
using System.Text.Json;
using TencentCloud.Common;
using TencentCloud.Common.Profile;
using TencentCloud.Hunyuan.V20230901;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;
using UserChatMessage = OpenAI.Chat.UserChatMessage;
using SystemChatMessage = OpenAI.Chat.SystemChatMessage;
using AssistantChatMessage = OpenAI.Chat.AssistantChatMessage;
using ChatMessageContentPartKind = OpenAI.Chat.ChatMessageContentPartKind;
using TencentCloud.Hunyuan.V20230901.Models;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.Conversations.Implementations.Hunyuan;

public class HunyuanConversationService : ConversationService
{
    private JsonHunyuanModelConfig GlobalModelConfig { get; }
    /// <summary>
    /// possible values:
    /// <list type="bullet">
    /// <item>hunyuan</item>
    /// <item>hunyuan-vision</item>
    /// </list>
    /// </summary>
    private string SuggestedType { get; }

    private bool IsVision => SuggestedType == "hunyuan-vision";

    private HunyuanClient ChatClient { get; }

    public HunyuanConversationService(string keyConfigText, string suggestedType, string modelConfigText)
    {
        JsonHunyuanKeyConfig keyConfig = JsonSerializer.Deserialize<JsonHunyuanKeyConfig>(keyConfigText)!;
        GlobalModelConfig = JsonSerializer.Deserialize<JsonHunyuanModelConfig>(modelConfigText)!;
        SuggestedType = suggestedType;
        ChatClient = new(new Credential
        {
            SecretId = keyConfig.Secret,
            SecretKey = keyConfig.ApiKey
        }, "", new ClientProfile() { HttpProfile = new() { Endpoint = keyConfig.Host } });
    }

    public override async IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, ModelConfig config, CurrentUser currentUser, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        Message[] msgs = IsVision ?
            messages.Select(OpenAIMessageToHunyuanVLMessage).ToArray() :
            messages.Select(OpenAIMessageToHunyuanMessage).ToArray();
        ChatCompletionsRequest req = new()
        {
            Model = GlobalModelConfig.Model, 
            Messages = msgs, 
            Stream = true, 
            Temperature = config.Temperature ?? GlobalModelConfig.Temperature,
        };
        ChatCompletionsResponse resp = await ChatClient.ChatCompletions(req);
        foreach (AbstractSSEModel.SSE message in resp)
        {
            HuyuanChatSegment seg = JsonSerializer.Deserialize<HuyuanChatSegment>(message.Data)!;
            yield return new ConversationSegment
            {
                TextSegment = seg.Choices[0].Delta.Content,
                InputTokenCount = seg.Usage.PromptTokens,
                OutputTokenCount = seg.Usage.CompletionTokens,
            };
        }
    }

    static Message OpenAIMessageToHunyuanMessage(OpenAIChatMessage message)
    {
        return message switch
        {
            UserChatMessage userMessage => new Message()
            {
                Role = "user",
                Content = string.Join("\r\n", userMessage.Content
                    .Select(x => x.Kind switch
                    {
                        var v when v == ChatMessageContentPartKind.Text => x.Text,
                        var v when v == ChatMessageContentPartKind.Image => x.ImageUri.ToString(),
                        _ => throw new ArgumentException("Unknown content part kind")
                    }))
            },
            SystemChatMessage systemMessage => new Message
            {
                Role = "system",
                Content = systemMessage.Content.Single(x => x.Kind == ChatMessageContentPartKind.Text).Text
            },
            AssistantChatMessage assistantMessage => new Message
            {
                Role = "assistant",
                Content = assistantMessage.Content.Single(x => x.Kind == ChatMessageContentPartKind.Text).Text
            },
            _ => throw new ArgumentException($"Unknown message type: {message.GetType()}")
        };
    }

    static Message OpenAIMessageToHunyuanVLMessage(OpenAIChatMessage message)
    {
        return message switch
        {
            UserChatMessage userMessage => new Message()
            {
                Role = "user",
                Contents = userMessage.Content
                    .Select(x => x.Kind switch
                    {
                        var v when v == ChatMessageContentPartKind.Text => new Content { Text = x.Text, Type = "text" },
                        var v when v == ChatMessageContentPartKind.Image => new Content { ImageUrl = new ImageUrl { Url = x.ImageUri.ToString() }, Text = "image_url" },
                        _ => throw new ArgumentException("Unknown content part kind")
                    })
                    .ToArray(),
            },
            _ => OpenAIMessageToHunyuanMessage(message)
        };
    }
}
