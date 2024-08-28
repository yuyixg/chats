using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations.Dtos;
using Sdcb.DashScope;
using Sdcb.DashScope.TextGeneration;
using System.Text.Json;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;
using UserChatMessage = OpenAI.Chat.UserChatMessage;
using SystemChatMessage = OpenAI.Chat.SystemChatMessage;
using AssistantChatMessage = OpenAI.Chat.AssistantChatMessage;
using ChatMessageContentPartKind = OpenAI.Chat.ChatMessageContentPartKind;
using System.Runtime.CompilerServices;
using Chats.BE.DB.Jsons;

namespace Chats.BE.Services.Conversations.Implementations.DashScope;

public class DashScopeConversationService : ConversationService
{
    private JsonDashScopeModelConfig GlobalModelConfig { get; }
    private DashScopeClient Client { get; }
    private TextGenerationClient ChatClient { get; }
    /// <summary>
    /// possible values:
    /// <list type="bullet">
    /// <item>qwen</item>
    /// <item>qwen-vl</item>
    /// </list>
    /// </summary>
    private string SuggestedType { get; }

    private bool IsVision => SuggestedType == "qwen-vl";

    public DashScopeConversationService(string keyConfigText, string suggestedType, string modelConfigText)
    {
        JsonDashScopeConfig keyConfig = JsonSerializer.Deserialize<JsonDashScopeConfig>(keyConfigText)!;
        GlobalModelConfig = JsonSerializer.Deserialize<JsonDashScopeModelConfig>(modelConfigText)!;
        Client = new DashScopeClient(keyConfig.ApiKey);
        ChatClient = Client.TextGeneration;
        SuggestedType = suggestedType;
    }


    public override async IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<OpenAIChatMessage> messages, JsonUserModelConfig config, CurrentUser currentUser, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        ChatParameters chatParameters = new()
        {
            Temperature = config.Temperature ?? GlobalModelConfig.Temperature,
            //MaxTokens = config.MaxLength,
            EnableSearch = GlobalModelConfig.EnableSearch != null && !IsVision ? config.EnableSearch : false,
            Seed = (ulong)Random.Shared.Next(),
            IncrementalOutput = true,
        };

        if (IsVision)
        {
            ChatVLMessage[] msgs = messages.Select(OpenAIMessageToQwenVL).ToArray();
            await foreach (ResponseWrapper<string, ChatTokenUsage> resp in ChatClient.ChatVLStreamed(GlobalModelConfig.ModelName, msgs, chatParameters, cancellationToken))
            {
                yield return new ConversationSegment
                {
                    TextSegment = resp.Output,
                    InputTokenCount = resp.Usage?.InputTokens ?? 0,
                    OutputTokenCount = resp.Usage?.OutputTokens ?? 0,
                };
            }
        }
        else
        {
            ChatMessage[] msgs = messages.Select(OpenAIMessageToQwen).ToArray();
            await foreach (ResponseWrapper<ChatOutput, ChatTokenUsage> resp in ChatClient.ChatStreamed(GlobalModelConfig.ModelName, msgs, chatParameters, cancellationToken))
            {
                yield return new ConversationSegment
                {
                    TextSegment = resp.Output.Text,
                    InputTokenCount = resp.Usage?.InputTokens ?? 0,
                    OutputTokenCount = resp.Usage?.OutputTokens ?? 0,
                };
            }
        }
    }

    static ChatMessage OpenAIMessageToQwen(OpenAIChatMessage message)
    {
        return message switch
        {
            UserChatMessage userMessage => ChatMessage.FromUser(string.Join("\r\n", userMessage.Content
                .Select(x => x.Kind switch
                {
                    var v when v == ChatMessageContentPartKind.Text => x.Text,
                    var v when v == ChatMessageContentPartKind.Image => x.ImageUri.ToString(),
                    _ => throw new ArgumentException("Unknown content part kind")
                }))), 
            SystemChatMessage systemMessage => ChatMessage.FromSystem(systemMessage.Content.Single(x => x.Kind == ChatMessageContentPartKind.Text).Text),
            AssistantChatMessage assistantMessage => ChatMessage.FromAssistant(assistantMessage.Content.Single(x => x.Kind == ChatMessageContentPartKind.Text).Text),
            _ => throw new ArgumentException($"Unknown message type: {message.GetType()}")
        };
    }

    static ChatVLMessage OpenAIMessageToQwenVL(OpenAIChatMessage message)
    {
        return message switch
        {
            UserChatMessage userMessage => ChatVLMessage.FromUser(userMessage.Content
                .Select(x => x.Kind switch
                {
                    var v when v == ChatMessageContentPartKind.Text => (ContentItem)ContentItem.FromText(x.Text),
                    var v when v == ChatMessageContentPartKind.Image => ContentItem.FromImage(x.ImageUri.ToString()),
                    _ => throw new ArgumentException("Unknown content part kind")
                })
                .ToArray()),
            SystemChatMessage systemMessage => ChatVLMessage.FromSystem(systemMessage.Content.Single(x => x.Kind == ChatMessageContentPartKind.Text).Text),
            AssistantChatMessage assistantMessage => ChatVLMessage.FromAssistant(assistantMessage.Content.Single(x => x.Kind == ChatMessageContentPartKind.Text).Text),
            _ => throw new ArgumentException($"Unknown message type: {message.GetType()}")
        };
    }

    protected override void Disposing()
    {
        Client.Dispose();
    }
}
