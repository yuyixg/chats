using Chats.BE.DB;
using OpenAI.Chat;

namespace Chats.BE.Services.ChatServices.Implementations.OpenAI;

public class GithubModelsChatService(Model model) : OpenAIChatService(model, new Uri("https://models.inference.ai.azure.com"))
{
    protected override ChatMessage[] FEPreprocess(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, ChatExtraDetails feOptions)
    {
        if (Model.ModelReference.ShortName == "Mistral")
        {
            // Mistral model does not support end-user ID
            options.EndUserId = null;
        }
        return base.FEPreprocess(messages, options, feOptions);
    }
}