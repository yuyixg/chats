using Azure.AI.OpenAI;
using Chats.BE.DB;
using Chats.BE.Services.Conversations.Implementations.OpenAI;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;

namespace Chats.BE.Services.Conversations.Implementations.Azure;

public class AzureConversationService(Model model) : OpenAIConversationService(model, CreateChatClient(model))
{
    static ChatClient CreateChatClient(Model model)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(model.ModelKey.Host, nameof(model.ModelKey.Host));
        ArgumentException.ThrowIfNullOrWhiteSpace(model.ModelKey.Secret, nameof(model.ModelKey.Secret));

        OpenAIClient api = new AzureOpenAIClient(new Uri(model.ModelKey.Host), new ApiKeyCredential(model.ModelKey.Secret));
        return api.GetChatClient(model.ApiModelId);
    }
}
