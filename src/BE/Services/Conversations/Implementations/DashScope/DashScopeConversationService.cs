using Chats.BE.Services.Conversations.Dtos;
using OpenAI.Chat;
using Sdcb.DashScope;
using Sdcb.DashScope.TextGeneration;
using System.Text.Json;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;

namespace Chats.BE.Services.Conversations.Implementations.DashScope;

public class DashScopeConversationService : ConversationService
{
    private JsonDashScopeModelConfig GlobalModelConfig { get; }
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
        ChatClient = new DashScopeClient(keyConfig.ApiKey).TextGeneration;
        SuggestedType = suggestedType;
    }


    public override IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<OpenAIChatMessage> messages, ModelConfig config, CancellationToken cancellationToken)
    {
        ChatParameters cp = new()
        {
            Temperature = config.Temperature ?? GlobalModelConfig.Temperature,
            MaxTokens = config.MaxLength,
            EnableSearch = GlobalModelConfig.EnableSearch != null ? config.EnableSearch : false,
            Seed = (ulong)Random.Shared.Next(),
            IncrementalOutput = true,
        };

        if (IsVision)
        {
            ChatVLMessage[] msgs = messages.Select(m => new ChatVLMessage(m.rol)).ToArray();
            ChatClient.ChatVLStreamed(GlobalModelConfig.Version, cp, cancellationToken);
        }
    }

    ChatVLMessage OpenAIMessageToQwenVL(OpenAIChatMessage message)
    {
        if (message is UserChatMessage userMessage)
        {
            return ChatVLMessage.FromUser(userMessage.Content);
        }
        else if (message is SystemChatMessage systemMessage)
        {
            return new ChatVLMessage(systemMessage.Text);
        }
        else
        {
            throw new ArgumentException("Unknown message type"
    }
}
