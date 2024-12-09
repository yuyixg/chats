using Chats.BE.Services.ChatServices.Dtos;
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
using Chats.BE.DB;
using Message = TencentCloud.Hunyuan.V20230901.Models.Message;

namespace Chats.BE.Services.ChatServices.Implementations.Hunyuan;

public class HunyuanChatService : ChatService
{
    private HunyuanClient ChatClient { get; }

    public HunyuanChatService(Model model) : base(model)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(model.ModelKey.Host, nameof(model.ModelKey.Host));
        ArgumentException.ThrowIfNullOrWhiteSpace(model.ModelKey.Secret, nameof(model.ModelKey.Secret));

        JsonHunyuanKeyConfig keyConfig = JsonSerializer.Deserialize<JsonHunyuanKeyConfig>(model.ModelKey.Secret)!;
        ChatClient = new(new Credential
        {
            SecretId = keyConfig.SecretId,
            SecretKey = keyConfig.SecretKey
        }, "", new ClientProfile() { HttpProfile = new() { Endpoint = model.ModelKey.Host } });
    }

    public override async IAsyncEnumerable<ChatSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        Message[] msgs = Model.ModelReference.AllowVision ?
            messages.Select(OpenAIMessageToHunyuanVLMessage).ToArray() :
            messages.Select(OpenAIMessageToHunyuanMessage).ToArray();
        ChatCompletionsRequest req = new()
        {
            Model = Model.ApiModelId, 
            Messages = msgs, 
            Stream = true, 
            Temperature = options.Temperature,
        };
        ChatCompletionsResponse resp = await ChatClient.ChatCompletions(req);
        foreach (AbstractSSEModel.SSE message in resp)
        {
            HuyuanChatSegment seg = JsonSerializer.Deserialize<HuyuanChatSegment>(message.Data)!;

            yield return new ChatSegment
            {
                TextSegment = seg.Choices[0].Delta.Content,
                FinishReason = ToFinishReason(seg.Choices[0].FinishReason),
                Usage = new Dtos.ChatTokenUsage
                { 
                    InputTokens = seg.Usage.PromptTokens, 
                    OutputTokens = seg.Usage.CompletionTokens 
                },
            };
        }
    }

    static ChatFinishReason? ToFinishReason(string reason)
    {
        return reason switch
        {
            "" => null,
            "stop" => ChatFinishReason.Stop,
            "sensitive" => ChatFinishReason.ContentFilter,
            "tool_calls" => ChatFinishReason.ToolCalls,
            _ => null,
        };
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
