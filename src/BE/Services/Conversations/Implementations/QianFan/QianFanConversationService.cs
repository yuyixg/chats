using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.Conversations.Implementations.GLM;
using Sdcb.WenXinQianFan;
using System.Runtime.CompilerServices;
using System.Text.Json;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;
using UserChatMessage = OpenAI.Chat.UserChatMessage;
using SystemChatMessage = OpenAI.Chat.SystemChatMessage;
using AssistantChatMessage = OpenAI.Chat.AssistantChatMessage;
using ChatMessageContentPartKind = OpenAI.Chat.ChatMessageContentPartKind;

namespace Chats.BE.Services.Conversations.Implementations.QianFan;

public class QianFanConversationService : ConversationService
{
    private QianFanClient ChatClient { get; }

    private JsonQianFanModelConfig GlobalModelConfig { get; }

    public QianFanConversationService(string keyConfigText, string modelConfigText)
    {
        JsonQianFanApiConfig apiConfig = JsonSerializer.Deserialize<JsonQianFanApiConfig>(keyConfigText)!;
        ChatClient = new QianFanClient(apiConfig.ApiKey, apiConfig.Secret);
        GlobalModelConfig = JsonSerializer.Deserialize<JsonQianFanModelConfig>(modelConfigText)!;
    }

    public override async IAsyncEnumerable<ConversationSegment> ChatStreamed(IReadOnlyList<OpenAIChatMessage> messages, ModelConfig config, CurrentUser currentUser, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        KnownModel model = new KnownModel(GlobalModelConfig.Model);
        throw new NotImplementedException();
        //ChatClient.ChatAsStreamAsync(model, 
    }

    static ChatMessage OpenAIMessageToQianFan(OpenAIChatMessage message)
    {
        throw new NotImplementedException();
    }
}
